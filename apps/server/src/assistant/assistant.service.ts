import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseService } from '../expense/expense.service';
import * as fs from 'fs';

interface GeminiPart {
  text?: string;
  thoughtSignature?: string;
  functionCall?: {
    name: string;
    args?: any;
    id?: string;
  };
  functionResponse?: {
    name: string;
    response: any;
  };
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
    role?: string;
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message?: string; code?: number };
}

const ASSISTANT_TOOLS = [
  {
    function_declarations: [
      {
        name: 'create_expense',
        description:
          'Создать новую запись о расходе по автомобилю в базе данных AutoNotes. Вызывай сразу, если пользователь просит записать, внести или добавить расход.',
        parameters: {
          type: 'OBJECT',
          properties: {
            amount: {
              type: 'NUMBER',
              description: 'Сумма расхода в рублях (положительное число больше нуля)',
            },
            categorySlug: {
              type: 'STRING',
              description:
                'Категория расхода: fuel (топливо/заправка/бензин/дизель), maintenance (ТО/масло/фильтры/свечи/регламент), repair (ремонт/запчасти), insurance (страховка/ОСАГО/КАСКО), fines (штрафы), wash (мойка/детейлинг), parking (парковка), other (прочее)',
              enum: [
                'fuel',
                'maintenance',
                'repair',
                'insurance',
                'fines',
                'wash',
                'parking',
                'other',
              ],
            },
            description: {
              type: 'STRING',
              description: 'Краткое описание расхода, деталей или работ',
            },
            mileage: {
              type: 'INTEGER',
              description:
                'Пробег автомобиля в километрах на момент расхода (если назван пользователем)',
            },
            liters: {
              type: 'NUMBER',
              description:
                'Количество заправленных литров топлива (только для топлива/заправки)',
            },
            pricePerLiter: {
              type: 'NUMBER',
              description: 'Цена за один литр топлива (если указана)',
            },
            date: {
              type: 'STRING',
              description:
                'Дата расхода в формате YYYY-MM-DD (если не указана, сегодняшняя)',
            },
          },
          required: ['amount', 'categorySlug'],
        },
      },
      {
        name: 'delete_expense',
        description:
          'Удалить запись о расходе из базы данных AutoNotes. ВНИМАНИЕ: вызывать ТОЛЬКО если пользователь уже явно подтвердил удаление (например: "Да, удаляй", "Удаляй", "Подтверждаю"). Никогда не вызывай без подтверждения!',
        parameters: {
          type: 'OBJECT',
          properties: {
            expenseId: {
              type: 'STRING',
              description:
                'ID расхода из переданного списка последних расходов автомобиля',
            },
          },
          required: ['expenseId'],
        },
      },
    ],
  },
];

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private cachedApiKey: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly expenseService: ExpenseService,
  ) {}

  private getApiKey(): string | null {
    if (this.cachedApiKey) return this.cachedApiKey;

    if (process.env.GEMINI_API_KEY) {
      this.cachedApiKey = process.env.GEMINI_API_KEY;
      return this.cachedApiKey;
    }

    try {
      const secretPath = '/home/alex/.secrets/.secrets.json';
      if (fs.existsSync(secretPath)) {
        const raw = fs.readFileSync(secretPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed?.gemini?.autonote) {
          this.cachedApiKey = parsed.gemini.autonote;
          return this.cachedApiKey;
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to read secrets.json: ${err}`);
    }

    return null;
  }

  async getMessages(userId: string, vehicleId: string) {
    await this.verifyVehicle(userId, vehicleId);

    return this.prisma.assistantMessage.findMany({
      where: { vehicleId, userId },
      orderBy: { createdAt: 'asc' },
      take: 60,
    });
  }

  async clearMessages(userId: string, vehicleId: string) {
    await this.verifyVehicle(userId, vehicleId);

    await this.prisma.assistantMessage.deleteMany({
      where: { vehicleId, userId },
    });

    return { success: true };
  }

  async chat(userId: string, vehicleId: string, userText: string) {
    const vehicle = await this.verifyVehicle(userId, vehicleId);
    const apiKey = this.getApiKey();

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Иваныч временно недоступен: API-ключ Gemini не настроен.',
      );
    }

    // 1. Save user message to database
    const userMessage = await this.prisma.assistantMessage.create({
      data: {
        userId,
        vehicleId,
        role: 'user',
        content: userText.trim(),
      },
    });

    // 2. Build full context of vehicle
    const vehicleContext = await this.buildVehicleContext(vehicle);

    // 3. Load recent conversation history (up to last 12 messages prior to this user message)
    const recentMessages = await this.prisma.assistantMessage.findMany({
      where: { vehicleId, userId },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    // Reverse to chronological order
    recentMessages.reverse();

    const contents: any[] = recentMessages.map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemPrompt = this.buildSystemPrompt(vehicleContext);

    // 4. Request Gemini API (Turn 1 with tools)
    let actionTaken: 'created' | 'deleted' | null = null;
    let replyText = '';

    const turn1 = await this.callGeminiTurn(
      apiKey,
      systemPrompt,
      contents,
      ASSISTANT_TOOLS,
    );

    const part1 = turn1.part;

    if (part1?.functionCall) {
      // Execute the tool call
      const execResult = await this.executeToolCall(
        part1.functionCall,
        userId,
        vehicleId,
      );
      actionTaken = execResult.actionTaken;

      // Turn 2: Send function result back to Gemini so Ivanych confirms in persona
      try {
        const turn2Contents = [
          ...contents,
          {
            role: 'model',
            parts: [part1],
          },
          {
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: part1.functionCall.name,
                  response: {
                    success: execResult.success,
                    message: execResult.message,
                  },
                },
              },
            ],
          },
        ];

        const turn2 = await this.callGeminiTurn(
          apiKey,
          systemPrompt,
          turn2Contents,
          ASSISTANT_TOOLS,
        );

        replyText = turn2.part?.text?.trim() || '';
      } catch (err: any) {
        this.logger.warn(
          `Turn 2 failed: ${err.message}. Using fallback confirmation text.`,
        );
      }

      if (!replyText) {
        replyText = execResult.message;
      }
    } else {
      // Plain text response from turn 1
      replyText =
        turn1.fullData?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || '')
          .join('')
          .trim() ||
        part1?.text?.trim() ||
        '';
    }

    if (!replyText) {
      replyText = 'Всё готово, дружище!';
    }

    // 5. Save model response to database
    const modelMessage = await this.prisma.assistantMessage.create({
      data: {
        userId,
        vehicleId,
        role: 'model',
        content: replyText,
      },
    });

    return {
      userMessage,
      modelMessage,
      actionTaken,
    };
  }

  private async callGeminiTurn(
    apiKey: string,
    systemPrompt: string,
    contents: any[],
    tools?: any[],
  ): Promise<{ part?: GeminiPart; fullData?: GeminiResponse; modelUsed?: string }> {
    const configuredModel = process.env.GEMINI_MODEL;
    // Prefer fast modern models with generous free quotas
    const models = Array.from(
      new Set(
        [
          configuredModel,
          'gemini-flash-lite-latest',
          'gemini-flash-latest',
          'gemini-3.8-flash',
          'gemini-3.5-flash-lite',
          'gemini-3.5-flash',
        ].filter(Boolean) as string[],
      ),
    );

    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const body: any = {
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        };

        if (tools && tools.length > 0) {
          body.tools = tools;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data: GeminiResponse = await response.json();

        if (data.error) {
          throw new Error(
            data.error.message || `Gemini API error code ${data.error.code}`,
          );
        }

        const candidatePart = data.candidates?.[0]?.content?.parts?.[0];
        if (candidatePart) {
          return { part: candidatePart, fullData: data, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        this.logger.warn(
          `Model ${model} failed: ${err.message}. Trying next fallback...`,
        );
      }
    }

    this.logger.error(`All Gemini models failed: ${lastError?.message}`);
    throw new InternalServerErrorException(
      'Иваныч сейчас занят под капотом и не смог ответить. Попробуй ещё раз через пару секунд.',
    );
  }

  private async executeToolCall(
    call: { name: string; args?: any },
    userId: string,
    vehicleId: string,
  ): Promise<{
    success: boolean;
    message: string;
    actionTaken: 'created' | 'deleted' | null;
  }> {
    if (call.name === 'create_expense') {
      const args = call.args || {};
      const amount = Number(args.amount);
      if (!amount || isNaN(amount) || amount <= 0) {
        return {
          success: false,
          message: 'Не удалось сохранить расход: некорректная сумма.',
          actionTaken: null,
        };
      }

      const categoryId = await this.findCategoryId(userId, args.categorySlug);
      const date = args.date
        ? new Date(args.date).toISOString()
        : new Date().toISOString();
      const mileage = args.mileage ? Math.round(Number(args.mileage)) : undefined;
      const liters = args.liters ? Number(args.liters) : undefined;
      let pricePerLiter = args.pricePerLiter ? Number(args.pricePerLiter) : undefined;

      if (liters && !pricePerLiter && amount) {
        pricePerLiter = Math.round((amount / liters) * 100) / 100;
      }

      const created = await this.expenseService.create(
        {
          amount,
          categoryId,
          vehicleId,
          date,
          description: args.description?.trim() || undefined,
          mileage,
          liters,
          pricePerLiter,
        },
        userId,
      );

      const catName = created.category?.name || 'Расход';
      return {
        success: true,
        message: `Расход успешно сохранён в базу данных: ${catName} на ${amount} ₽${
          mileage ? `, пробег ${mileage} км` : ''
        }.`,
        actionTaken: 'created',
      };
    }

    if (call.name === 'delete_expense') {
      const args = call.args || {};
      const expenseId = String(args.expenseId || '').trim();

      if (!expenseId) {
        return {
          success: false,
          message: 'Не указан ID расхода для удаления.',
          actionTaken: null,
        };
      }

      const expense = await this.prisma.expense.findFirst({
        where: { id: expenseId, vehicleId, vehicle: { userId } },
        include: { category: true },
      });

      if (!expense) {
        return {
          success: false,
          message: `Расход с ID "${expenseId}" не найден или уже был удален.`,
          actionTaken: null,
        };
      }

      await this.expenseService.remove(expenseId, userId);

      const desc = expense.description || expense.category?.name || 'Расход';
      return {
        success: true,
        message: `Расход "${desc}" на сумму ${expense.amount} ₽ успешно удален из базы данных.`,
        actionTaken: 'deleted',
      };
    }

    return {
      success: false,
      message: `Неизвестная функция: ${call.name}`,
      actionTaken: null,
    };
  }

  private async findCategoryId(
    userId: string,
    categorySlug?: string,
  ): Promise<string> {
    const categories = await this.prisma.category.findMany({
      where: { OR: [{ isSystem: true }, { userId }] },
    });

    if (!categorySlug) {
      const other = categories.find((c) => c.slug === 'other');
      return other?.id || categories[0]?.id;
    }

    const cleanSlug = categorySlug.toLowerCase().trim();
    let found = categories.find((c) => c.slug.toLowerCase() === cleanSlug);
    if (found) return found.id;

    const mapping: Record<string, string> = {
      fuel: 'fuel',
      petrol: 'fuel',
      gas: 'fuel',
      бензин: 'fuel',
      топливо: 'fuel',
      заправка: 'fuel',
      maintenance: 'maintenance',
      to: 'maintenance',
      то: 'maintenance',
      обслуживание: 'maintenance',
      масло: 'maintenance',
      repair: 'repair',
      ремонт: 'repair',
      запчасти: 'repair',
      insurance: 'insurance',
      страховка: 'insurance',
      осаго: 'insurance',
      каско: 'insurance',
      wash: 'wash',
      moyka: 'wash',
      мойка: 'wash',
      parking: 'parking',
      парковка: 'parking',
      fine: 'fines',
      fines: 'fines',
      штраф: 'fines',
      штрафы: 'fines',
      other: 'other',
      прочее: 'other',
    };

    const targetSlug = mapping[cleanSlug] || cleanSlug;
    found = categories.find((c) => c.slug.toLowerCase() === targetSlug);
    if (found) return found.id;

    const other = categories.find((c) => c.slug === 'other');
    return other?.id || categories[0]?.id;
  }

  private buildSystemPrompt(vehicleContext: string): string {
    return `Ты — Иваныч, опытный, душевный и рассудительный автомеханик-эксперт и персональный цифровой ассистент в приложении AutoNotes.
У тебя 25 лет реального стажа в автосервисе. Ты знаешь моторы, подвеску, коробки и электрику до последнего болта, отлично разбираешься в заводских регламентах, болячках конкретных марок и артикулах запчастей.

ТВОЙ ХАРАКТЕР И СТИЛЬ ОБЩЕНИЯ:
- Обращайся к пользователю уважительно, дружелюбно и по-мужски просто ("дружище", "земляк", или просто на "ты").
- Общайся тепло, уверенно, с лёгким добрым профессиональным юмором автомеханика, но без панибратства и без грубости.
- Отвечай ёмко и структурированно, без шаблонной роботизированной "воды".
- Используй аккуратное Markdown-форматирование: списки с дефисами, выделение жирным ключевых деталей и артикулов.

ДАННЫЕ АВТОМОБИЛЯ ПОЛЬЗОВАТЕЛЯ:
${vehicleContext}

ТВОИ КЛЮЧЕВЫЕ ОБЯЗАННОСТИ:
1. РЕГЛАМЕНТ ТО И РЕКОМЕНДАЦИИ:
   - Если пользователь спрашивает, что пора менять, когда ТО, какие работы предстоят:
     - Опирайся на текущий одометр, даты и регламент ТО из переданного контекста.
     - Учитывай заводские регламенты и слабые места именно этой марки/модели/мотора (по VIN и году).
     - Чётко раздели: что уже просрочено или горит прямо сейчас, что нужно сделать в ближайшую тысячу км, а за чем просто понаблюдать.
2. ПОДБОР ЗАПЧАСТЕЙ И ССЫЛКИ НА AUTODOC:
   - Если пользователь спрашивает про расходники или запчасти (например: "Мне нужны свечи", "какое масло лить", "подскажи фильтр", "какие колодки взять"):
     - Назови конкретные артикулы: сначала заводской оригинал (OEM), затем 1-3 проверенных надежных аналога (например, Bosch, Denso, NGK, Mann, Mahle/Knecht, Brembo, TRW, Lemforder, CTR, Gates и т.д. в зависимости от детали).
     - ДЛЯ КАЖДОГО АРТИКУЛА ОБЯЗАТЕЛЬНО СФОРМИРУЙ ПРЯМУЮ ССЫЛКУ НА AUTODOC.RU в формате:
       [Название или Бренд + Артикул](https://www.autodoc.ru/man/<MAN_ID>/part/<АРТИКУЛ>)
       где <MAN_ID> — код производителя в Autodoc (например: Hyundai/Kia — 647, VAG/VW/Audi/Skoda — 534, BMW — 511, Toyota/Lexus — 558, Mercedes — 597, Nissan — 555, Mann-Filter — 4, Bosch — 30, NGK — 15, Denso — 19, Brembo — 68, Sangsin — 5315, Mahle — 42, Filtron — 26, Лукойл — 685, Mobil — 605),
       а <АРТИКУЛ> — очищенный артикул в нижнем регистре без пробелов, тире и точек строчной латиницей или цифрами (например: https://www.autodoc.ru/man/647/part/1884610060 или https://www.autodoc.ru/man/4/part/w81180).
       Никогда НЕ используй /price/0/ — такой путь возвращает ошибку на Автодоке. Если точный код производителя неизвестен, указывай ссылку https://www.autodoc.ru.
   - ВНИМАНИЕ К СКЛАДУ В ГАРАЖЕ:
     - Обязательно сверься с разделом "Склад запчастей" в контексте авто! Если у пользователя нужная запчасть уже куплена и лежит в гараже, обрадуй его: "Кстати, у тебя в гараже на складе уже лежит {название} (артикул {артикул}, {кол-во} шт.)!".
3. АНАЛИЗ РАСХОДОВ И ИСТОРИИ:
   - Если пользователь интересуется затратами, средним чеком, расходом топлива или прошлыми заменами — давай конкретные точные цифры из переданной истории трат.
4. УПРАВЛЕНИЕ РАСХОДАМИ (ДОБАВЛЕНИЕ И УДАЛЕНИЕ):
   - ДОБАВЛЕНИЕ РАСХОДА:
     - Если пользователь просит записать, добавить или внести расход (например: "заправился на 2500 руб, 45л, пробег 115000", "запиши мойку 800р", "купил масло 4000р"):
       СРАЗУ вызывай функцию create_expense с соответствующими параметрами. Никаких подтверждений не требуй.
       Определи категорию: fuel (топливо/заправка), maintenance (ТО/масло/фильтры/свечи), repair (ремонт/запчасти/подвеска), wash (мойка), parking (парковка), insurance (страховка), fines (штрафы), other (прочее).
       Если назван пробег — передай в mileage, если литры — в liters.
   - УДАЛЕНИЕ РАСХОДА:
     - ВАЖНЕЙШЕЕ ПРАВИЛО: УДАЛЕНИЕ ВЫПОЛНЯЕТСЯ ТОЛЬКО С ПОДТВЕРЖДЕНИЕМ!
     - Если пользователь просит удалить расход ("удали последний расход", "удали мойку на 800", "удали заправку"):
       ЕСЛИ пользователь ЕЩЁ НЕ ПОДТВЕРДИЛ удаление явными словами (нет слов "Да, удаляй", "Удаляй", "Подтверждаю" в ответ на твой вопрос):
       НЕ ВЫЗЫВАЙ delete_expense!
       Найди этот расход в списке последних расходов ниже, назови его точные детали (дата, категория, сумма, описание) и прямо спроси:
       "Ты точно хочешь удалить этот расход: [Дата, Категория, Сумма ₽, Описание]? Напиши «Да, удаляй» для подтверждения."
     - ТОЛЬКО КОГДА пользователь подтвердил удаление (написал "Да, удаляй", "Удаляй", "Подтверждаю", "Да, удали" в ответ на подтверждение):
       ВЫЗЫВАЙ функцию delete_expense с точным ID этого расхода из списка.`;
  }

  private async verifyVehicle(userId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
      include: {
        serviceIntervals: true,
        parts: true,
        tireSets: true,
        expenses: {
          include: { category: true, serviceInterval: true },
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Автомобиль не найден');
    }

    return vehicle;
  }

  private async buildVehicleContext(vehicle: any): Promise<string> {
    const lines: string[] = [];

    // General info
    lines.push(
      `• Автомобиль: ${vehicle.brand} ${vehicle.model} (${vehicle.year} г.в.)`,
    );
    lines.push(`• Текущий пробег: ${vehicle.mileage?.toLocaleString('ru-RU')} км`);
    if (vehicle.vin) lines.push(`• VIN-номер: ${vehicle.vin}`);
    if (vehicle.licensePlate) lines.push(`• Госномер: ${vehicle.licensePlate}`);
    if (vehicle.registrationNumber)
      lines.push(`• Номер СТС: ${vehicle.registrationNumber}`);
    if (vehicle.purchaseDate) {
      lines.push(
        `• Дата покупки: ${new Date(vehicle.purchaseDate).toLocaleDateString(
          'ru-RU',
        )}`,
      );
    }
    if (vehicle.notes) lines.push(`• Заметки владельца: ${vehicle.notes}`);

    // Service Intervals
    lines.push(`\n[РЕГЛАМЕНТ ТЕХОБСЛУЖИВАНИЯ (ТО)]`);
    if (!vehicle.serviceIntervals || vehicle.serviceIntervals.length === 0) {
      lines.push('Регламенты ТО пока не заведены в системе.');
    } else {
      const now = Date.now();
      for (const si of vehicle.serviceIntervals) {
        let statusKm = '';
        if (si.intervalKm && si.lastServiceMileage !== null) {
          const remaining = si.lastServiceMileage + si.intervalKm - vehicle.mileage;
          statusKm =
            remaining <= 0
              ? `(ПРОСРОЧЕНО на ${Math.abs(remaining)} км)`
              : `(осталось ${remaining} км)`;
        }
        let statusDate = '';
        if (si.intervalMonths && si.lastServiceDate) {
          const d = new Date(si.lastServiceDate);
          d.setMonth(d.getMonth() + si.intervalMonths);
          const days = Math.ceil((d.getTime() - now) / (1000 * 60 * 60 * 24));
          statusDate =
            days <= 0
              ? `(ПРОСРОЧЕНО на ${Math.abs(days)} дн.)`
              : `(осталось ${days} дн. до ${d.toLocaleDateString('ru-RU')})`;
        }

        const lastInfo = [
          si.lastServiceMileage !== null
            ? `посл. пробег ${si.lastServiceMileage} км`
            : null,
          si.lastServiceDate
            ? `посл. дата ${new Date(si.lastServiceDate).toLocaleDateString('ru-RU')}`
            : null,
        ]
          .filter(Boolean)
          .join(', ');

        lines.push(
          `- ${si.name}: каждые ${si.intervalKm || '—'} км / ${
            si.intervalMonths || '—'
          } мес. ${statusKm} ${statusDate} [${
            lastInfo || 'нет данных о прошлом ТО'
          }]`,
        );
      }
    }

    // Parts inventory
    lines.push(`\n[СКЛАД ЗАПЧАСТЕЙ В ГАРАЖЕ (В НАЛИЧИИ У ВЛАДЕЛЬЦА)]`);
    if (!vehicle.parts || vehicle.parts.length === 0) {
      lines.push('Склад пуст.');
    } else {
      for (const p of vehicle.parts) {
        lines.push(
          `- ${p.name} | Артикул: ${p.article || 'не указан'} | В наличии: ${
            p.quantity
          } шт. | Цена: ${p.price} ₽ ${
            p.location ? `| Место: ${p.location}` : ''
          }`,
        );
      }
    }

    // Recent expenses
    lines.push(`\n[ПОСЛЕДНИЕ РАСХОДЫ И РЕМОНТЫ (ИСТОРИЯ)]`);
    if (!vehicle.expenses || vehicle.expenses.length === 0) {
      lines.push('История расходов пуста.');
    } else {
      for (const e of vehicle.expenses.slice(0, 30)) {
        const d = new Date(e.date).toLocaleDateString('ru-RU');
        const partsInfo =
          Array.isArray(e.parts) && e.parts.length > 0
            ? ` (детали: ${e.parts
                .map(
                  (p: any) =>
                    `${p.name || ''} ${p.article ? `[${p.article}]` : ''}`,
                )
                .join(', ')})`
            : '';
        const litersInfo = e.liters ? ` | Литры: ${e.liters} л` : '';
        const mileageInfo = e.mileage ? ` | Пробег: ${e.mileage} км` : '';
        lines.push(
          `- [ID: ${e.id}] ${d} | ${e.category?.name || 'Расход'} (${
            e.category?.slug || 'other'
          }): ${e.amount} ₽ | ${e.description || 'без описания'}${litersInfo}${mileageInfo}${partsInfo}`,
        );
      }
    }

    // Tires
    lines.push(`\n[КОМПЛЕКТЫ ШИН И КОЛЁС]`);
    if (!vehicle.tireSets || vehicle.tireSets.length === 0) {
      lines.push('Данные о шинах не внесены.');
    } else {
      for (const t of vehicle.tireSets) {
        const seasonName =
          t.season === 'summer'
            ? 'Лето'
            : t.season === 'winter_stud'
            ? 'Зима (шипы)'
            : t.season === 'winter_friction'
            ? 'Зима (липучка)'
            : 'Всесезонка';
        const status = t.isMounted
          ? `[УСТАНОВЛЕН СЕЙЧАС с пробега ${
              t.installedMileage?.toLocaleString('ru-RU') || '—'
            } км]`
          : `[НА ХРАНЕНИИ: ${t.storageLocation || 'не указано'}]`;
        lines.push(
          `- ${t.name} (${seasonName}) | Размер: ${t.size || '—'} | Протектор: ${
            t.treadDepth ? `${t.treadDepth} мм` : '—'
          } | Пробег шин: ${t.totalMileage?.toLocaleString('ru-RU')} км ${status}`,
        );
      }
    }

    return lines.join('\n');
  }
}
