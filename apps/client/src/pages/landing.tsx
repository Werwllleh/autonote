import { useState, useRef } from "react"
import { Navigate } from "react-router-dom"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Car,
  Fuel,
  BarChart3,
  Shield,
  Wallet,
  Handshake,
  Wrench,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  CalendarCheck,
  ListChecks,
  Sparkles,
  Camera,
  FileText,
  Smartphone,
  ExternalLink,
  Check,
  X,
  Boxes,
  Disc,
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
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const directionMap = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
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
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
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
        visible: { transition: { staggerChildren: 0.1 } },
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
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 4 Superpowers of Ivanych
const ivanychSuperpowers = [
  {
    number: "01",
    badge: "Быстрая запись",
    title: "Напиши как другу — он всё поймет",
    description:
      "Не тратьте время на заполнение кучи полей. Напишите в чате: «Заправился на 2500 руб, 45 литров, пробег 159 400». Иваныч сам заполнит категорию, сумму, литры и обновит одометр авто.",
    icon: Sparkles,
    color: "from-amber-500/20 to-orange-500/5",
    accent: "text-amber-500",
  },
  {
    number: "02",
    badge: "Подбор запчастей",
    title: "Оригиналы и аналоги с прямыми ссылками на Автодок",
    description:
      "Забудьте про многочасовые поиски на форумах. Спросите: «Какие свечи взять?» или «Какое масло лить?». Иваныч подберет OEM-артикулы и проверенные заменители (Mann, Bosch, Brembo, NGK) со ссылками на заказ.",
    icon: Wrench,
    color: "from-blue-500/20 to-cyan-500/5",
    accent: "text-blue-500",
  },
  {
    number: "03",
    badge: "Гаражный склад",
    title: "Помнит про ТО и знает детали на полке",
    description:
      "Иваныч следит за регламентами ТО по пробегу вашей модели и помнит купленные запчасти: «Кстати, у тебя в гараже уже лежит масляный фильтр (1 шт.), заказывать не надо!».",
    icon: Boxes,
    color: "from-emerald-500/20 to-teal-500/5",
    accent: "text-emerald-500",
  },
  {
    number: "04",
    badge: "Безопасность",
    title: "Удаление только с вашего подтверждения",
    description:
      "Полный контроль над данными. Иваныч никогда не удалит расход случайно: он найдет запись, назовет дату и сумму и удалит её только после вашего явного подтверждения «Да, удаляй».",
    icon: Shield,
    color: "from-violet-500/20 to-purple-500/5",
    accent: "text-violet-500",
  },
]

// Interactive demo scenarios
const demoScenarios = [
  {
    id: "maintenance",
    label: "Что пора менять по ТО?",
    icon: CalendarCheck,
    userText: "Иваныч, глянь по регламенту — что пора менять по пробегу?",
    badge: "Регламент ТО",
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
    label: "Подбери свечи и колодки",
    icon: Wrench,
    userText: "Подскажи, какие передние колодки и свечи зажигания поставить?",
    badge: "Подбор на Autodoc.ru",
    reply: [
      "Без проблем, держи проверенные варианты на твой мотор:",
      "**Свечи зажигания (комплект):**",
      "• Заводской оригинал: [Hyundai/Kia 18846-10060](https://www.autodoc.ru/price/0/1884610060)",
      "• Надёжный аналог: [NGK 1578 LZKR6B-10E](https://www.autodoc.ru/price/0/1578)",
      "**Передние тормозные колодки:**",
      "• Оригинал OEM: [Hyundai/Kia 58101-4LA00](https://www.autodoc.ru/price/0/581014LA00)",
      "• Мягкие, не скрипят и не пылят: [Sangsin Brake SP1399](https://www.autodoc.ru/price/0/SP1399)",
      "💡 *Кстати, у тебя в гараже на складе уже лежит масляный фильтр Mann W81180 (1 шт.), так что его покупать не нужно!*",
    ],
  },
  {
    id: "expense",
    label: "Запиши заправку на 2500 ₽",
    icon: Fuel,
    userText: "Заправил 45 литров АИ-95 на 2 500 рублей, пробег 159 400",
    badge: "Мгновенная запись",
    reply: [
      "Всё сделал, земляк!",
      "✅ **Расход внесён:** Топливо на **2 500 ₽** (45 л по 55.55 ₽/л).",
      "🚗 **Одометр обновлён:** текущий пробег зафиксирован — **159 400 км**.",
      "📊 **Средний расход топлива:** 7.6 л / 100 км.",
      "Ни гвоздя, ни жезла на дороге! Если что-то ещё записать — пиши в чат.",
    ],
  },
]

// Comparison items
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
    autonote: "Оригиналы + проверенные аналоги со ссылками на Автодок",
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

// Features of the platform
const features = [
  {
    icon: Sparkles,
    title: "AI-механик Иваныч",
    badge: "Уникально",
    description:
      "Персональный цифровой мастер в кармане: знает регламент вашей модели, вносит траты из чата и подбирает артикулы.",
  },
  {
    icon: Fuel,
    title: "Учёт топлива и одометр",
    description:
      "Автоматический расчёт среднего расхода на 100 км, стоимости километра и автообновление пробега автомобиля.",
  },
  {
    icon: CalendarCheck,
    title: "Контроль регламентов ТО",
    description:
      "Наглядные индикаторы оставшихся километров и дней до замены масла, фильтров, колодок и ремней.",
  },
  {
    icon: Disc,
    title: "Сезонный учёт шин и колёс",
    badge: "Новинка",
    description:
      "Учёт летней и зимней резины (шипы/липучка), глубина протектора в миллиметрах, общий пробег шин и место хранения.",
  },
  {
    icon: Camera,
    title: "Фото чеков и накладных",
    badge: "Новинка",
    description:
      "Прикрепляйте фото чеков прямо с камеры телефона. Автоматическая оптимизация в лёгкий WebP-формат.",
  },
  {
    icon: FileText,
    title: "Сервисный отчёт для продажи",
    badge: "Новинка",
    description:
      "Генерация красивого PDF-отчёта или публичной веб-страницы. Подтверждённая история повышает цену авто на 10-15%.",
  },
  {
    icon: Smartphone,
    title: "PWA — приложение на экране",
    badge: "Новинка",
    description:
      "Устанавливается на экран смартфона в один клик без App Store и Google Play. Быстрый доступ и работа офлайн.",
  },
  {
    icon: BarChart3,
    title: "Наглядная аналитика и CSV",
    description:
      "Динамика затрат по месяцам, структуре расходов и экспорт полной истории в Excel или Google Sheets.",
  },
]

const stats = [
  { value: "24/7", label: "Иваныч на связи" },
  { value: "2 сек", label: "На запись расхода" },
  { value: "15-20%", label: "Экономия на содержании" },
  { value: "100%", label: "Конфиденциальность данных" },
]

export function LandingPage() {
  const isAuthed = useAuthStore((s) => !!s.accessToken)
  const [activeScenarioId, setActiveScenarioId] = useState("maintenance")

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const activeScenario =
    demoScenarios.find((s) => s.id === activeScenarioId) || demoScenarios[0]

  if (isAuthed && isAppDomain()) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-amber-500/20 selection:text-amber-500">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2.5 text-lg font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-primary text-primary-foreground shadow-md shadow-amber-500/20">
              <Car className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <span>AutoNotes</span>
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              >
                с AI-механиком
              </Badge>
            </div>
          </a>

          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-6 md:flex text-sm">
              <a
                href="#ivanych"
                className="text-muted-foreground transition-colors hover:text-foreground font-medium flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Иваныч</span>
              </a>
              <a
                href="#demo"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Демо-чат
              </a>
              <a
                href="#comparison"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Сравнение
              </a>
              <a
                href="#features"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Возможности
              </a>
            </nav>

            <div className="flex items-center gap-2">
              {isAuthed ? (
                <Button size="sm" asChild className="rounded-xl shadow-sm">
                  <a href={appUrl("/dashboard")}>
                    В гараж
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="rounded-xl">
                    <a href={appUrl("/login")}>Войти</a>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/90 text-primary-foreground shadow-md shadow-amber-500/20"
                  >
                    <a href={appUrl("/register")}>
                      Попробовать
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.25, 0.45, 0.25],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 left-1/2 h-[550px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500/20 via-primary/20 to-orange-500/20 blur-3xl"
          />
          <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto max-w-6xl px-4 sm:px-6"
        >
          {/* Badge */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400 backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>Встречайте: первый трекер авто с личным AI-механиком Иванычем</span>
            </motion.div>
          </div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-4xl text-center text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[64px] leading-[1.12]"
          >
            Твой автомобиль под присмотром{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-primary bg-clip-text text-transparent">
              умного механика Иваныча
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-center text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            Забудьте о нудных блокнотах и таблицах. Напишите в чате:{" "}
            <span className="text-foreground font-semibold">«Заправил 45 л на 2500 ₽, пробег 159 400»</span> — Иваныч
            сам занесёт трату, обновит одометр, подберёт проверенные артикулы на Автодоке и предупредит о замене масла.
          </motion.p>

          {/* Call to actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Button
              size="lg"
              className="h-12 px-7 rounded-xl text-base bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/90 text-primary-foreground shadow-lg shadow-amber-500/25 w-full sm:w-auto"
              asChild
            >
              <a href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>{isAuthed ? "Перейти в гараж" : "Открыть гараж с Иванычем"}</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 rounded-xl text-base w-full sm:w-auto border-border/80 hover:bg-muted/60"
              asChild
            >
              <a href="#demo">
                <span>Как работает Иваныч</span>
                <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground" />
              </a>
            </Button>
          </motion.div>

          {/* Hero Visual Mockup: Vehicle Status + Ivanych Live Chat */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto mt-14 max-w-4xl"
          >
            <div className="grid gap-4 lg:grid-cols-12 items-stretch">
              {/* Left Column: Vehicle Health & Specs Widget */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border/70 bg-card/90 p-5 shadow-2xl backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">KIA Rio III Рестайлинг</div>
                        <div className="text-xs text-muted-foreground">159 400 км пробега • 2019 г.</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                      В строю
                    </Badge>
                  </div>

                  {/* ТО alert warning */}
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <Wrench className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                      <span>Скоро ТО: Замена масла и фильтра</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Осталось 600 км по регламенту (на 160 000 км). Иваныч уже нашёл артикулы на Автодоке.
                    </p>
                  </div>

                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="rounded-xl border border-border/50 bg-muted/40 p-2.5">
                      <div className="text-[11px] text-muted-foreground">Расходы в месяц</div>
                      <div className="text-base font-bold text-foreground mt-0.5">14 850 ₽</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">-12% к прошлому</div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-muted/40 p-2.5">
                      <div className="text-[11px] text-muted-foreground">Средний расход</div>
                      <div className="text-base font-bold text-foreground mt-0.5">7.6 л / 100 км</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">АИ-95</div>
                    </div>
                  </div>
                </div>

                {/* Tires badge preview */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Disc className="h-3.5 w-3.5 text-primary" />
                    <span>Шины: Летние Continental (6.2 мм)</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-500">Норма</span>
                </div>
              </div>

              {/* Right Column: Live Chat with Ivanych */}
              <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-border/70 bg-card/95 p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-border">
                      <img
                        src="/avatars/ivanych.webp"
                        alt="Иваныч"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">Иваныч</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          Автомеханик (25 лет опыта)
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">В контексте твоего KIA Rio</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                    <span>Онлайн</span>
                  </div>
                </div>

                {/* Simulated conversation bubbles */}
                <div className="my-4 space-y-3">
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-xs text-primary-foreground leading-relaxed shadow-sm">
                      Заправил 45 л на 2 500 ₽, одометр 159 400 км. И подскажи свечи зажигания!
                    </div>
                  </div>

                  {/* Model bubble */}
                  <div className="flex gap-2.5 justify-start">
                    <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-border">
                      <img
                        src="/avatars/ivanych.webp"
                        alt="Иваныч"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-muted/80 border border-border/60 px-3.5 py-2.5 text-xs text-foreground leading-relaxed space-y-1.5 shadow-sm">
                      <p>
                        Принято, земляк! Заправку записал, одометр обновил до <strong>159 400 км</strong>.
                      </p>
                      <p>По свечам на твой мотор проверенные варианты:</p>
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-center gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>Оригинал: <strong>18846-10060</strong></span>
                          <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1 py-0.2 rounded text-[10px] font-semibold">
                            Автодок <ExternalLink className="h-2 w-2" />
                          </span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>Аналог: <strong>NGK 1578</strong></span>
                          <span className="inline-flex items-center gap-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1 py-0.2 rounded text-[10px] font-semibold">
                            Автодок <ExternalLink className="h-2 w-2" />
                          </span>
                        </li>
                      </ul>
                      <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        💡 <em>Кстати, на складе в гараже у тебя уже лежит масляный фильтр Mann — заказывать не нужно!</em>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Input */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">Спросите у Иваныча про запчасти, ТО или расходы...</span>
                  <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Numbers Bar */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <StaggerChildren className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Flagship Section: 4 Superpowers of Ivanych */}
      <section id="ivanych" className="py-20 sm:py-28 relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Главное преимущество AutoNotes</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Знакомьтесь: Иваныч — ваш личный автомеханик
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Не просто чат-бот, а опытный мастер со стажем 25 лет. Он знает регламенты конкретно вашей марки,
              понимает реальные проблемы моторов и подвески и помогает экономить на деталях.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ivanychSuperpowers.map((sp, idx) => (
              <FadeIn key={sp.title} delay={idx * 0.1}>
                <div className={`h-full rounded-2xl border border-border/70 bg-gradient-to-br ${sp.color} p-6 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 shadow-sm`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-11 w-11 rounded-xl bg-card border border-border/80 flex items-center justify-center ${sp.accent} shadow-sm`}>
                        <sp.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground tracking-wider">{sp.number}</span>
                    </div>
                    <Badge variant="secondary" className="mb-2 text-[10px] font-semibold">
                      {sp.badge}
                    </Badge>
                    <h3 className="text-base font-bold mb-2 text-foreground leading-snug">
                      {sp.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {sp.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Playground Section */}
      <section id="demo" className="py-16 sm:py-24 bg-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <FadeIn className="text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Попробуйте пообщаться с Иванычем прямо сейчас
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
              Выберите частый сценарий обслуживания, чтобы увидеть, как Иваныч отвечает и помогает водителю:
            </p>
          </FadeIn>

          {/* Interactive scenario tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {demoScenarios.map((sc) => {
              const isActive = sc.id === activeScenarioId
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScenarioId(sc.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105"
                      : "bg-card text-muted-foreground border-border/80 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <sc.icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-amber-500"}`} />
                  <span>{sc.label}</span>
                </button>
              )
            })}
          </div>

          {/* Interactive chat window */}
          <div className="mt-6 rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScenario.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* User message */}
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-xs sm:text-sm text-primary-foreground max-w-[85%] leading-relaxed shadow-sm">
                    {activeScenario.userText}
                  </div>
                </div>

                {/* Model response */}
                <div className="flex gap-3 justify-start">
                  <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 mt-0.5 border border-border shadow-sm">
                    <img
                      src="/avatars/ivanych.webp"
                      alt="Иваныч"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted/80 border border-border/60 px-4 py-3 text-xs sm:text-sm text-foreground max-w-[85%] leading-relaxed space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 pb-1 border-b border-border/40">
                      <span className="font-bold text-xs">Иваныч</span>
                      <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20">
                        {activeScenario.badge}
                      </Badge>
                    </div>
                    {activeScenario.reply.map((line, i) => (
                      <p key={i} className="whitespace-pre-wrap">
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

      {/* Comparison Table Section */}
      <section id="comparison" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3">
              <ListChecks className="h-3.5 w-3.5" />
              <span>Честное сравнение</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Почему AutoNotes с Иванычем удобнее блокнота и Excel
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Большинство автолюбителей бросают вести учёт через месяц, потому что открывать громоздкие таблицы
              после каждой заправки неудобно. Мы сделали процесс мгновенным:
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-12 overflow-x-auto">
            <div className="min-w-[640px] rounded-2xl border border-border/80 bg-card overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40">
                    <th className="py-4 px-5 font-bold text-muted-foreground w-1/4">Возможность</th>
                    <th className="py-4 px-5 font-semibold text-muted-foreground w-1/4">Блокнот / Заметки</th>
                    <th className="py-4 px-5 font-semibold text-muted-foreground w-1/4">Таблицы Excel</th>
                    <th className="py-4 px-5 font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 w-1/4">
                      AutoNotes с Иванычем
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-foreground">
                        {row.feature}
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          <span>{row.notebook}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          <span>{row.excel}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-foreground bg-amber-500/5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="h-4 w-4 shrink-0 text-emerald-500" />
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

      {/* Complete Ecosystem Features (All Phase 2 and 3 additions) */}
      <section id="features" className="py-20 sm:py-28 bg-muted/30 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Всё необходимое для вашего автомобиля
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
              AutoNotes закрывает все потребности автовладельца в одном удобном и быстром веб-сервисе:
            </p>
          </FadeIn>

          <StaggerChildren className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="group h-full rounded-2xl border border-border/70 bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:-translate-y-1 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      {feature.badge && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold ${
                            feature.badge === "Уникально"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mb-2 font-bold text-base text-foreground">{feature.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Financial Benefits: Real Car Cost & Resale Value */}
      <section id="benefits" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Экономьте семейный бюджет и продавайте авто дороже
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Автовладельцы с AutoNotes экономят до 20% на содержании за счёт своевременной замены расходников
            </p>
          </FadeIn>

          <div className="mt-14 space-y-16">
            {/* Row 1: Cost of 1 km */}
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <FadeIn direction="right">
                <div>
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>Финансовый контроль</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                    Знайте реальную стоимость километра пути
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                    Мелкие расходы — кофе на АЗС, мойка, сезонный шиномонтаж, незамерзайка и штрафы — незаметно
                    складываются в круглые суммы. AutoNotes показывает полную аналитику и точную стоимость 1 км пробега.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Автоматический расчёт стоимости каждого пройденного километра",
                      "Сравнение расходов по месяцам и категориям",
                      "Выявление неочевидных источников перерасхода",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
              <FadeIn direction="left" delay={0.2}>
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm">Структура расходов за год</span>
                    <span className="text-xs text-muted-foreground">159 400 ₽ всего</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { cat: "Топливо", amount: "72 400 ₽", pct: 45, color: "bg-blue-500" },
                      { cat: "ТО и запчасти", amount: "42 000 ₽", pct: 26, color: "bg-amber-500" },
                      { cat: "Страховка ОСАГО/КАСКО", amount: "26 000 ₽", pct: 16, color: "bg-violet-500" },
                      { cat: "Мойка и уход", amount: "11 500 ₽", pct: 7, color: "bg-emerald-500" },
                      { cat: "Шины и шиномонтаж", amount: "7 500 ₽", pct: 6, color: "bg-cyan-500" },
                    ].map((item) => (
                      <div key={item.cat}>
                        <div className="mb-1 flex justify-between text-xs sm:text-sm">
                          <span>{item.cat}</span>
                          <span className="font-semibold">{item.amount}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Row 2: Car sale with PDF report */}
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <FadeIn direction="right" className="order-2 lg:order-1">
                <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                    <div>
                      <div className="font-bold text-sm">Сервисный отчёт AutoNotes</div>
                      <div className="text-xs text-muted-foreground">KIA Rio III (2019) • Полная история</div>
                    </div>
                    <Badge variant="outline" className="text-xs text-blue-500 bg-blue-500/10">
                      Готов к печати
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { date: "15.03.2026", title: "Замена масла + фильтра (Mann W81180)", km: "159 400 км", sum: "4 850 ₽" },
                      { date: "12.01.2026", title: "Передние колодки Sangsin SP1399", km: "154 200 км", sum: "3 600 ₽" },
                      { date: "20.10.2025", title: "Установка зимних шин Nokian (7.5 мм)", km: "150 000 км", sum: "2 800 ₽" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/30 text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{r.title}</div>
                          <div className="text-[11px] text-muted-foreground">{r.date} • {r.km}</div>
                        </div>
                        <div className="font-bold text-foreground">{r.sum}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
              <FadeIn direction="left" delay={0.2} className="order-1 lg:order-2">
                <div>
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <Handshake className="h-3.5 w-3.5" />
                    <span>Выгода при продаже</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                    Продавайте автомобиль быстрее и дороже
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                    Покупатели на вторичном рынке боятся скрытых дефектов и скрученного пробега. Ссылка на публичный
                    отчёт или распечатанная сервисная книжка AutoNotes подтверждают регулярные ТО и заботу об автомобиле.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Повышение рыночной цены авто на 10-15%",
                      "Экспорт в один клик в красивый PDF или по защищённой ссылке",
                      "Подтверждение чеками и номерами оригинальных запчастей",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="py-20 sm:py-28 bg-muted/30 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Как начать за 1 минуту
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Никаких долгих настроек — зарегистрируйтесь и сразу начинайте общаться с Иванычем
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Создайте аккаунт", desc: "Регистрация за 30 секунд по email." },
              { step: "02", title: "Добавьте авто", desc: "Укажите марку, модель, год и текущий пробег." },
              { step: "03", title: "Пишите Иванычу", desc: "Отправляйте траты и задавайте вопросы в чате." },
              { step: "04", title: "Контролируйте всё", desc: "Наблюдайте за регламентами ТО и экономьте бюджет." },
            ].map((st, i) => (
              <FadeIn key={st.step} delay={i * 0.1}>
                <div className="relative text-center p-6 rounded-2xl border border-border/60 bg-card">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-primary/10 text-xl font-bold text-amber-600 dark:text-amber-400">
                    {st.step}
                  </div>
                  <h3 className="text-base font-bold mb-1.5">{st.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{st.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action with Ivanych */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-primary/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <FadeIn>
            <div className="mx-auto mb-6 relative h-20 w-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-primary shadow-2xl">
              <img
                src="/avatars/ivanych.webp"
                alt="Иваныч"
                className="h-full w-full rounded-full object-cover border-2 border-background"
              />
              <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Познакомьте свой автомобиль{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-primary bg-clip-text text-transparent">
                с Иванычем уже сегодня
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-muted-foreground">
              Бесплатно. Без привязки карт и навязчивой рекламы. Просто удобный гараж с персональным экспертом.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-13 px-8 text-base rounded-xl bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/90 text-primary-foreground shadow-xl shadow-amber-500/25 w-full sm:w-auto"
                asChild
              >
                <a href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>{isAuthed ? "Перейти в гараж" : "Создать гараж с Иванычем"}</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
            {!isAuthed && (
              <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
                Уже зарегистрированы?{" "}
                <a href={appUrl("/login")} className="text-primary font-medium hover:underline">
                  Войти в аккаунт
                </a>
              </p>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5 text-base font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Car className="h-4 w-4" />
              </div>
              <span>AutoNotes</span>
              <span className="text-xs text-muted-foreground font-normal">| AI-помощник автолюбителя</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-muted-foreground">
              <a href="#ivanych" className="hover:text-foreground transition-colors">
                Иваныч
              </a>
              <a href="#demo" className="hover:text-foreground transition-colors">
                Демо-чат
              </a>
              <a href="#comparison" className="hover:text-foreground transition-colors">
                Сравнение
              </a>
              <a href="#features" className="hover:text-foreground transition-colors">
                Возможности
              </a>
              <a href="#benefits" className="hover:text-foreground transition-colors">
                Выгода
              </a>
            </nav>
          </div>
          <div className="mt-6 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AutoNotes. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}
