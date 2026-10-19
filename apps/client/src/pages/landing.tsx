import { useState, useRef } from "react"
import { Navigate } from "react-router-dom"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Car,
  Fuel,
  Shield,
  Wrench,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Camera,
  FileText,
  Smartphone,
  ExternalLink,
  Check,
  X,
  Boxes,
  Disc,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"

const APP_DOMAIN = "my.auto-notes.ru"

function isAppDomain() {
  const h = window.location.hostname
  return h === APP_DOMAIN || h === "localhost" || h === "127.0.0.1"
}

function appUrl(path: string) {
  if (isAppDomain()) return path
  return `https://${APP_DOMAIN}${path}`
}

function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  const directionMap = {
    up: { y: 35, x: 0 },
    down: { y: -35, x: 0 },
    left: { x: 35, y: 0 },
    right: { x: -35, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionMap[direction],
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...directionMap[direction] }
      }
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerChildren({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 25 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 01 / Superpowers of Ivanych
const ivanychSuperpowers = [
  {
    idx: "01.01",
    badge: "Ввод без форм",
    title: "Напиши как другу — он всё поймёт",
    description:
      "Не заполняйте десятки полей. Напишите: «Заправился на 2500 руб, 45 литров, пробег 159 400». Иваныч сам определит категорию, сумму, литры и обновит одометр авто.",
    icon: Sparkles,
    accent: "text-amber-400",
    borderHover: "hover:border-amber-400/40",
  },
  {
    idx: "01.02",
    badge: "Интеграция с Автодок",
    title: "Оригиналы и проверенные аналоги со ссылками",
    description:
      "Забудьте про поиски на форумах. Спросите: «Какие свечи взять?» или «Какое масло лить?». Иваныч назовёт OEM-артикулы и надёжные бренды (Mann, Bosch, Brembo, NGK) с прямыми ссылками на Autodoc.ru.",
    icon: Wrench,
    accent: "text-sky-400",
    borderHover: "hover:border-sky-400/40",
  },
  {
    idx: "01.03",
    badge: "Гаражный склад",
    title: "Помнит про регламент ТО и детали на полке",
    description:
      "Иваныч в реальном времени следит за регламентами ТО по пробегу вашей модели и помнит склад: «Кстати, у тебя в гараже уже лежит масляный фильтр (1 шт.), покупать не нужно!».",
    icon: Boxes,
    accent: "text-emerald-400",
    borderHover: "hover:border-emerald-400/40",
  },
  {
    idx: "01.04",
    badge: "Безопасность данных",
    title: "Удаление только по вашему подтверждению",
    description:
      "Полный контроль. Иваныч никогда не удалит расход случайно: он найдёт нужную запись, назовёт дату и сумму и удалит её строго после вашего подтверждения «Да, удаляй».",
    icon: Shield,
    accent: "text-purple-400",
    borderHover: "hover:border-purple-400/40",
  },
]

// 02 / Interactive Demo scenarios
const demoScenarios = [
  {
    id: "maintenance",
    num: "01",
    label: "Регламент ТО",
    userText: "Иваныч, глянь по регламенту — что пора менять по пробегу?",
    badge: "Анализ одометра и регламента",
    reply: [
      "Здорово, дружище! Твой **KIA Rio** прошёл уже **159 400 км**. Вот расклад по регламенту:",
      "• **Замена моторного масла и фильтра:** осталось всего **600 км** (регламент каждые 10 000 км). Пора закупать расходники!",
      "• **Свечи зажигания:** крайняя замена была на 120 000 км, на следующем ТО обязательно ставим новые.",
      "• **Тормозная жидкость:** по сроку (2 года) всё в норме, запас ещё на 8 месяцев.",
      "Записать замену масла в список дел или сразу подобрать артикулы фильтра на Автодоке?",
    ],
  },
  {
    id: "parts",
    num: "02",
    label: "Подбор запчастей",
    userText: "Подскажи, какие передние колодки и свечи зажигания поставить?",
    badge: "Прямые ссылки Autodoc.ru",
    reply: [
      "Без проблем, держи проверенные варианты на твой мотор:",
      "**Свечи зажигания (комплект 4 шт.):**",
      "• Заводской оригинал: [Hyundai/Kia 18846-10060](https://www.autodoc.ru/price/0/1884610060)",
      "• Надёжный аналог: [NGK 1578 LZKR6B-10E](https://www.autodoc.ru/price/0/1578)",
      "**Передние тормозные колодки:**",
      "• Оригинал OEM: [Hyundai/Kia 58101-4LA00](https://www.autodoc.ru/price/0/581014LA00)",
      "• Мягкие, не скрипят и не пылят: [Sangsin Brake SP1399](https://www.autodoc.ru/price/0/SP1399)",
      "💡 *Кстати, у тебя в гараже на складе уже лежит масляный фильтр Mann W81180 (1 шт.), так что его заказывать не нужно!*",
    ],
  },
  {
    id: "expense",
    num: "03",
    label: "Запись расхода",
    userText: "Заправил 45 литров АИ-95 на 2 500 рублей, пробег 159 400",
    badge: "Мгновенное сохранение в БД",
    reply: [
      "Всё сделал, земляк!",
      "✅ **Расход внесён:** Топливо на **2 500 ₽** (45 л по 55.55 ₽/л).",
      "🚗 **Одометр обновлён:** текущий пробег зафиксирован — **159 400 км**.",
      "📊 **Средний расход топлива:** 7.6 л / 100 км.",
      "Ни гвоздя, ни жезла на дороге! Если что-то ещё записать — пиши в чат.",
    ],
  },
]

// 03 / Comparison items
const comparisonRows = [
  {
    feature: "Запись расхода на ходу",
    notebook: "Искать ручку и блокнот",
    excel: "Тяжело открывать таблицы со смартфона",
    autonote: "2 секунды в чате: «Заправился на 2500, 45л»",
  },
  {
    feature: "Подбор запчастей и расходников",
    notebook: "Искать артикулы на форумах",
    excel: "Ручной поиск в поисковиках",
    autonote: "Оригиналы + надёжные аналоги со ссылками на Автодок",
  },
  {
    feature: "Контроль регламентов ТО",
    notebook: "Легко пропустить нужный пробег",
    excel: "Нужно писать сложные формулы",
    autonote: "Иваныч автоматически считает остаток км по одометру",
  },
  {
    feature: "Склад запчастей в гараже",
    notebook: "Забываешь, что уже куплено",
    excel: "Отдельная громоздкая вкладка",
    autonote: "Иваныч помнит детали на полке и напомнит до покупки",
  },
  {
    feature: "Сезонный учёт шин и колёс",
    notebook: "Нет",
    excel: "Редко кто ведёт",
    autonote: "Глубина протектора в мм, пробег комплекта, место хранения",
  },
  {
    feature: "Чеки, заказ-наряды и фото",
    notebook: "Теряются и выцветают",
    excel: "Забивают память телефона",
    autonote: "Сжатие в WebP и надёжное прикрепление к расходу",
  },
  {
    feature: "Отчёт при продаже автомобиля",
    notebook: "Словам покупатели не верят",
    excel: "Не презентабельно",
    autonote: "Фирменный PDF-отчёт и публичная веб-страница авто",
  },
]

// 04 / Platform Features
const bentoFeatures = [
  {
    idx: "04.01",
    tag: "ФЛАГМАН",
    title: "AI-механик Иваныч",
    desc: "Персональный цифровой мастер в кармане: знает регламент вашей модели по VIN, вносит траты из чата и подбирает артикулы.",
    icon: Sparkles,
    accent: "text-amber-400",
    cols: "lg:col-span-2",
  },
  {
    idx: "04.02",
    tag: "ТЕЛЕМЕТРИЯ",
    title: "Топливо и авто-одометр",
    desc: "Автоматический расчёт среднего расхода на 100 км, стоимости километра и автообновление одометра автомобиля.",
    icon: Fuel,
    accent: "text-sky-400",
    cols: "lg:col-span-1",
  },
  {
    idx: "04.03",
    tag: "ШИНЫ И КОЛЁСА",
    title: "Сезонный учёт шин",
    desc: "Учёт летней и зимней резины (шипы/липучка), замер глубины протектора в мм, пробег комплекта и место хранения.",
    icon: Disc,
    accent: "text-emerald-400",
    cols: "lg:col-span-1",
  },
  {
    idx: "04.04",
    tag: "ДОКУМЕНТЫ",
    title: "Чеки и накладные в WebP",
    desc: "Прикрепляйте фото чеков прямо с камеры смартфона. Автоматическая оптимизация до 1600px без потери качества.",
    icon: Camera,
    accent: "text-purple-400",
    cols: "lg:col-span-1",
  },
  {
    idx: "04.05",
    tag: "ЛИКВИДНОСТЬ",
    title: "Сервисный PDF-отчёт для продажи",
    desc: "Генерация красивого PDF-отчёта или публичной веб-страницы. Подтверждённая история повышает цену авто на 10-15%.",
    icon: FileText,
    accent: "text-blue-400",
    cols: "lg:col-span-2",
  },
  {
    idx: "04.06",
    tag: "OFFLINE READY",
    title: "PWA — приложение на экране",
    desc: "Устанавливается на домашний экран смартфона в 1 клик без App Store и Google Play. Мгновенный доступ и работа офлайн.",
    icon: Smartphone,
    accent: "text-rose-400",
    cols: "lg:col-span-1",
  },
]

export function LandingPage() {
  const isAuthed = useAuthStore((s) => !!s.accessToken)
  const [activeScenarioId, setActiveScenarioId] = useState("maintenance")

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])

  const activeScenario =
    demoScenarios.find((s) => s.id === activeScenarioId) || demoScenarios[0]

  if (isAuthed && isAppDomain()) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white selection:bg-white selection:text-black font-sans antialiased">
      {/* Floating Island Header (Cloudmill-inspired luxury pill) */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="bg-[#0B0B0B]/85 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all">
          {/* Left: Branding */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Car className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">AutoNotes</span>
              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
                  AI ONLINE
                </span>
              </div>
            </div>
          </a>

          {/* Center: Numbered pill navigation */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            <a
              href="#ivanych"
              className="text-white/60 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-white/5 font-mono"
            >
              01 / Иваныч
            </a>
            <a
              href="#demo"
              className="text-white/60 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-white/5 font-mono"
            >
              02 / Демо
            </a>
            <a
              href="#comparison"
              className="text-white/60 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-white/5 font-mono"
            >
              03 / Баттл
            </a>
            <a
              href="#features"
              className="text-white/60 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-white/5 font-mono"
            >
              04 / Возможности
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {!isAuthed && (
              <a
                href={appUrl("/login")}
                className="hidden sm:inline-flex text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 transition-colors"
              >
                Войти
              </a>
            )}

            <Button
              size="sm"
              asChild
              className="rounded-full bg-white text-black font-semibold text-xs px-4 sm:px-5 py-2 hover:bg-neutral-200 active:scale-95 transition-all shadow-sm border-0"
            >
              <a href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}>
                <span>{isAuthed ? "В гараж" : "Открыть гараж"}</span>
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section: Monumental Typography & High-End Cockpit HUD */}
      <section ref={heroRef} className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Subtle architectural background grid & watermark */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center select-none overflow-hidden opacity-[0.03]">
          <span className="font-extrabold text-[18vw] tracking-tighter leading-none text-white">
            AUTONOTES
          </span>
        </div>

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-white/[0.04] to-transparent blur-3xl" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto max-w-6xl px-4 sm:px-6"
        >
          {/* Index Tag */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-mono tracking-widest text-white/60 uppercase backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>00 / ЦИФРОВОЙ ГАРАЖ НОВОГО ПОКОЛЕНИЯ</span>
            </motion.div>
          </div>

          {/* Monumental Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-7 max-w-5xl text-center text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-extrabold tracking-[-0.04em] leading-[1.05] text-white"
          >
            ВАШ АВТОМОБИЛЬ ПОД ПРИСМОТРОМ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/40">
              ЦИФРОВОГО МЕХАНИКА ИВАНЫЧА
            </span>
          </motion.h1>

          {/* Editorial Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-2xl text-center text-base sm:text-lg text-white/60 leading-relaxed font-normal"
          >
            Откажитесь от пыльных блокнотов и таблиц. Напишите Иванычу в чате:{" "}
            <span className="text-white font-medium">«Заправил 45 л на 2500 ₽, пробег 159 400»</span> — он мгновенно
            внесёт трату, обновит одометр, подберёт проверенные артикулы на Автодоке и рассчитает регламент ТО.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Button
              size="lg"
              className="h-12 px-7 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all shadow-[0_0_24px_rgba(255,255,255,0.15)] w-full sm:w-auto border-0"
              asChild
            >
              <a href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}>
                <span>{isAuthed ? "В гараж к Иванычу" : "Создать гараж с Иванычем"}</span>
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 rounded-full text-xs font-semibold uppercase tracking-wider bg-transparent text-white/80 border-white/15 hover:bg-white/5 hover:text-white transition-all w-full sm:w-auto"
              asChild
            >
              <a href="#demo">
                <span>Живой тест-драйв</span>
                <ChevronRight className="ml-1.5 h-4 w-4 text-white/40" />
              </a>
            </Button>
          </motion.div>

          {/* High-End Telemetry Cockpit Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="rounded-3xl border border-white/10 bg-[#121214] p-2 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="grid gap-3 lg:grid-cols-12 items-stretch">
                {/* Left: Telemetry Panel */}
                <div className="lg:col-span-5 rounded-2xl bg-[#161618] border border-white/5 p-5 flex flex-col justify-between">
                  <div>
                    {/* Vehicle Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">KIA Rio III Рестайлинг</div>
                          <div className="text-xs font-mono text-white/40">159 400 км • 2019</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                        В СТРОЮ
                      </Badge>
                    </div>

                    {/* Telemetry ТО alert */}
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-500/[0.07] border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5" />
                          <span>Замена масла и фильтра</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          ЧЕРЕЗ 600 КМ
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">
                        Регламентное ТО на 160 000 км. Иваныч уже проверил артикулы на Автодоке.
                      </p>
                    </div>

                    {/* Telemetry Sensor Metrics */}
                    <div className="grid grid-cols-2 gap-2.5 mt-3">
                      <div className="rounded-xl border border-white/5 bg-[#121214] p-3">
                        <div className="text-[11px] font-mono text-white/40">РАСХОД В МЕСЯЦ</div>
                        <div className="text-base font-bold text-white mt-1">14 850 ₽</div>
                        <div className="text-[10px] font-mono text-emerald-400 mt-0.5">-12% к прошлому</div>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-[#121214] p-3">
                        <div className="text-[11px] font-mono text-white/40">СРЕДНИЙ РАСХОД</div>
                        <div className="text-base font-bold text-white mt-1">7.6 л / 100 км</div>
                        <div className="text-[10px] font-mono text-white/40 mt-0.5">АИ-95</div>
                      </div>
                    </div>
                  </div>

                  {/* Tires Sensor Footer */}
                  <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center gap-2">
                      <Disc className="h-3.5 w-3.5 text-white/40" />
                      <span>Continental ContiPremium (6.2 мм)</span>
                    </div>
                    <span className="font-mono text-emerald-400 text-[11px]">НОРМА</span>
                  </div>
                </div>

                {/* Right: Ivanych Terminal / Mission Control Console */}
                <div className="lg:col-span-7 rounded-2xl bg-[#0E0E10] border border-white/5 p-5 flex flex-col justify-between">
                  {/* Console Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/10">
                        <img
                          src="/avatars/ivanych.webp"
                          alt="Иваныч"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0E0E10]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">Иваныч</span>
                          <span className="text-[10px] font-mono text-white/40 tracking-wider">
                            [25 ЛЕТ СТАЖА]
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40">Контекст: KIA Rio III (2019)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>АКТИВЕН</span>
                    </div>
                  </div>

                  {/* Terminal Chat Feed */}
                  <div className="my-4 space-y-3 font-sans">
                    {/* User Command */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white/10 border border-white/10 px-4 py-2.5 text-xs text-white leading-relaxed">
                        Заправил 45 л на 2 500 ₽, пробег 159 400 км. И подскажи свечи зажигания!
                      </div>
                    </div>

                    {/* Ivanych Response */}
                    <div className="flex gap-2.5 justify-start">
                      <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-white/10">
                        <img
                          src="/avatars/ivanych.webp"
                          alt="Иваныч"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-[#161618] border border-white/5 px-4 py-3 text-xs text-white/90 leading-relaxed space-y-2">
                        <p>
                          Принято, земляк! Заправку записал, одометр обновил до <strong>159 400 км</strong>.
                        </p>
                        <p className="text-white/60">По свечам проверенные варианты на твой мотор:</p>
                        <div className="space-y-1.5 pl-1 text-[11.5px]">
                          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-white/80">Оригинал: <strong>Hyundai/Kia 18846-10060</strong></span>
                            <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                              Автодок <ExternalLink className="h-2.5 w-2.5" />
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                            <span className="text-white/80">Аналог: <strong>NGK 1578 (LZKR6B-10E)</strong></span>
                            <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                              Автодок <ExternalLink className="h-2.5 w-2.5" />
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-amber-400/90 pt-1.5 border-t border-white/5 flex items-center gap-1.5">
                          <Boxes className="h-3 w-3 shrink-0" />
                          <span>На складе в гараже у тебя уже лежит масляный фильтр Mann — не покупай зря!</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Input line placeholder */}
                  <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-white/30 font-mono">
                    <span className="truncate">&gt; Спросите у Иваныча про масло, колодки или ТО...</span>
                    <div className="h-6 w-6 rounded-lg bg-white/5 text-white/60 flex items-center justify-center shrink-0">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Counter Bar (Swiss Minimalist) */}
      <section className="border-y border-white/10 bg-[#0E0E10]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <StaggerChildren className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { val: "24 / 7", label: "Иваныч в строю" },
              { val: "2 сек", label: "На запись расхода в чате" },
              { val: "15-20%", label: "Экономия на ТО и деталях" },
              { val: "100%", label: "Конфиденциальность данных" },
            ].map((st) => (
              <StaggerItem key={st.label} className="text-center sm:text-left">
                <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {st.val}
                </div>
                <div className="mt-1.5 text-xs font-mono uppercase tracking-wider text-white/40">
                  {st.label}
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Section 01 / Флагман: 4 Суперсилы Иваныча */}
      <section id="ivanych" className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <div className="flex items-baseline gap-3 mb-2 font-mono text-xs tracking-widest text-white/40 uppercase">
              <span>01</span>
              <span>/</span>
              <span>ПЕРСОНАЛЬНЫЙ МАСТЕР</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white leading-tight">
              Иваныч помнит детали, которые вы забыли
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed font-normal">
              Не просто чат-бот, а опытный механик со стажем 25 лет. Он знает регламенты вашей марки,
              понимает слабые места моторов и подвески и помогает экономить на деталях без ущерба ресурсу.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ivanychSuperpowers.map((sp, idx) => (
              <FadeIn key={sp.title} delay={idx * 0.08}>
                <div
                  className={`group relative h-full rounded-3xl bg-[#121214] border border-white/10 p-7 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 ${sp.borderHover} shadow-[0_4px_24px_rgba(0,0,0,0.4)]`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white transition-transform group-hover:scale-105">
                        <sp.icon className={`h-5 w-5 ${sp.accent}`} />
                      </div>
                      <span className="font-mono text-xs text-white/30 tracking-widest">{sp.idx}</span>
                    </div>

                    <div className="mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                        {sp.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2.5 leading-snug">
                      {sp.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                      {sp.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Section 02 / Интерактивный тест-драйв демо */}
      <section id="demo" className="py-20 sm:py-28 bg-[#0E0E10] border-y border-white/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <FadeIn className="text-center sm:text-left">
            <div className="flex items-baseline gap-3 mb-2 font-mono text-xs tracking-widest text-white/40 uppercase">
              <span>02</span>
              <span>/</span>
              <span>ЖИВОЙ ТЕСТ-ДРАЙВ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-white">
              Попробуйте пообщаться с Иванычем
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/60">
              Выберите частый сценарий, чтобы оценить логику и экспертность ассистента:
            </p>
          </FadeIn>

          {/* Scenario radio-capsules */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {demoScenarios.map((sc) => {
              const isActive = sc.id === activeScenarioId
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white text-black shadow-lg shadow-white/10 scale-105"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span className="opacity-50">{sc.num}</span>
                  <span>{sc.label}</span>
                </button>
              )
            })}
          </div>

          {/* Interactive Terminal Card */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#121214] p-5 sm:p-7 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScenario.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 font-sans"
              >
                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-white/10 border border-white/10 px-4 py-2.5 text-xs sm:text-sm text-white max-w-[85%] leading-relaxed">
                    {activeScenario.userText}
                  </div>
                </div>

                {/* Model Bubble */}
                <div className="flex gap-3 justify-start">
                  <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 mt-0.5 border border-white/10">
                    <img
                      src="/avatars/ivanych.webp"
                      alt="Иваныч"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-[#161618] border border-white/5 px-4 sm:px-5 py-3.5 text-xs sm:text-sm text-white/90 max-w-[88%] leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <span className="font-bold text-xs text-white">Иваныч</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {activeScenario.badge}
                      </span>
                    </div>
                    {activeScenario.reply.map((line, i) => (
                      <p key={i} className="whitespace-pre-wrap leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Section 03 / Баттл: Бескомпромиссное сравнение */}
      <section id="comparison" className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <div className="flex items-baseline gap-3 mb-2 font-mono text-xs tracking-widest text-white/40 uppercase">
              <span>03</span>
              <span>/</span>
              <span>БЕСКОМПРОМИССНОЕ СРАВНЕНИЕ</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white leading-tight">
              Почему AutoNotes побеждает блокнот и Excel
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed font-normal">
              Обычный учёт забрасывают через месяц, потому что открывать тяжёлые таблицы на телефоне неудобно.
              Мы избавились от рутины:
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-12 overflow-x-auto">
            <div className="min-w-[680px] rounded-3xl border border-white/10 bg-[#121214] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-white/40 w-1/4">
                      Критерий
                    </th>
                    <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-white/40 w-1/4">
                      Бумажный блокнот
                    </th>
                    <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-white/40 w-1/4">
                      Таблицы Excel
                    </th>
                    <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-white bg-white/[0.04] w-1/4">
                      AutoNotes с Иванычем
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-medium text-white">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-white/40">
                        <span className="inline-flex items-center gap-2">
                          <X className="h-3.5 w-3.5 text-white/30 shrink-0" />
                          <span>{row.notebook}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white/40">
                        <span className="inline-flex items-center gap-2">
                          <X className="h-3.5 w-3.5 text-white/30 shrink-0" />
                          <span>{row.excel}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-white bg-white/[0.03]">
                        <span className="inline-flex items-center gap-2 text-emerald-400">
                          <Check className="h-4 w-4 shrink-0" />
                          <span>{row.autonote}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 04 / Экосистема Bento Grid */}
      <section id="features" className="py-24 sm:py-32 bg-[#0E0E10] border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <div className="flex items-baseline gap-3 mb-2 font-mono text-xs tracking-widest text-white/40 uppercase">
              <span>04</span>
              <span>/</span>
              <span>ПОЛНЫЙ КОНТРОЛЬ АВТО</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white leading-tight">
              Всё необходимое в одном цифровом гараже
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed font-normal">
              AutoNotes объединяет телеметрию пробега, сезонный шиномонтаж, чеки и аналитику:
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bentoFeatures.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.07} className={f.cols}>
                <div className="group h-full rounded-3xl bg-[#121214] border border-white/10 p-7 flex flex-col justify-between hover:border-white/25 transition-all duration-500 hover:-translate-y-1 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white transition-transform group-hover:scale-105">
                        <f.icon className={`h-5 w-5 ${f.accent}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-white/40 tracking-wider bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          {f.tag}
                        </span>
                        <span className="font-mono text-xs text-white/30">{f.idx}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-snug">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Section 05 / Финансовая выгода и окупаемость */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn direction="right">
              <div>
                <div className="flex items-baseline gap-3 mb-2 font-mono text-xs tracking-widest text-emerald-400 uppercase">
                  <span>05</span>
                  <span>/</span>
                  <span>ФИНАНСОВЫЙ РАСЧЁТ</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-white mb-5 leading-tight">
                  Знайте реальную стоимость километра и продавайте авто дороже
                </h2>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-6 font-normal">
                  Мелкие расходы — мойки, штрафы, незамерзайка, парковки — складываются в круглые суммы.
                  AutoNotes вычисляет точную себестоимость каждого километра и формирует подтверждённую сервисную книжку,
                  которая повышает доверие покупателей на вторичном рынке.
                </p>
                <div className="space-y-3 font-mono text-xs">
                  {[
                    "Точный расчёт стоимости 1 км пробега с учётом всех трат",
                    "Подтверждённая сервисная книжка в PDF в 1 клик",
                    "Увеличение рыночной цены автомобиля на 10-15%",
                  ].map((it) => (
                    <div key={it} className="flex items-center gap-3 text-white/80">
                      <div className="h-4 w-4 rounded-full bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="font-mono text-xs text-white/40 uppercase">СТРУКТУРА ЗАТРАТ</span>
                  <span className="font-mono text-xs text-white font-bold">159 400 ₽ / ГОД</span>
                </div>
                <div className="space-y-3.5 mt-5">
                  {[
                    { name: "Топливо", val: "72 400 ₽", pct: "45%", color: "bg-sky-400" },
                    { name: "ТО и запчасти", val: "42 000 ₽", pct: "26%", color: "bg-amber-400" },
                    { name: "Страховка", val: "26 000 ₽", pct: "16%", color: "bg-purple-400" },
                    { name: "Мойка и детейлинг", val: "11 500 ₽", pct: "7%", color: "bg-emerald-400" },
                    { name: "Шиномонтаж", val: "7 500 ₽", pct: "6%", color: "bg-rose-400" },
                  ].map((row) => (
                    <div key={row.name}>
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-white/60">{row.name}</span>
                        <span className="text-white font-semibold">{row.val}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: row.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Final Action CTA (Cloudmill Swiss Poster aesthetic) */}
      <section className="py-24 sm:py-32 border-t border-white/10 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-[0.03] select-none">
          <span className="text-[22vw] font-extrabold text-white tracking-tighter">IVANYCH</span>
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <FadeIn>
            <div className="mx-auto mb-6 relative h-20 w-20 rounded-full overflow-hidden border-2 border-white/20 p-1 bg-[#121214] shadow-2xl">
              <img
                src="/avatars/ivanych.webp"
                alt="Иваныч"
                className="h-full w-full rounded-full object-cover"
              />
              <span className="absolute bottom-1 right-1 block h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0B0B0B]" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-white leading-tight">
              Познакомьте свой автомобиль с Иванычем
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/60 leading-relaxed font-normal">
              Бесплатно. Без банковских карт и рекламы. Добавьте авто и оцените, насколько проще вести учёт с личным механиком.
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                className="h-13 px-8 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all shadow-[0_0_32px_rgba(255,255,255,0.2)] border-0"
                asChild
              >
                <a href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}>
                  <span>{isAuthed ? "Перейти в гараж" : "Открыть гараж с Иванычем"}</span>
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Minimalist Swiss Footer */}
      <footer className="border-t border-white/10 bg-[#0E0E10] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                <Car className="h-3.5 w-3.5" />
              </div>
              <span className="font-extrabold text-sm text-white">AutoNotes</span>
              <span className="font-mono text-xs text-white/40">| mission control for your car</span>
            </div>

            <nav className="flex flex-wrap justify-center gap-6 font-mono text-xs text-white/50">
              <a href="#ivanych" className="hover:text-white transition-colors">
                01 / Иваныч
              </a>
              <a href="#demo" className="hover:text-white transition-colors">
                02 / Демо
              </a>
              <a href="#comparison" className="hover:text-white transition-colors">
                03 / Баттл
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                04 / Возможности
              </a>
            </nav>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/30">
            <div>&copy; {new Date().getFullYear()} AutoNotes. Все права защищены.</div>
            <div>Референс стиля: Cloudmill Aesthetics.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
