import { useState, useRef, useEffect } from "react"
import { Navigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Fuel,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Check,
  X,
  Boxes,
  Disc,
  ArrowUpRight,
  Plus,
  Send,
  ChevronDown,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

const isStandalone =
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true)

function isAppDomain() {
  const h = window.location.hostname
  return h === "my.auto-notes.ru" || h === "localhost" || h === "127.0.0.1"
}

// -------------------------------------------------------------
// Cloudmill Signature Animation Primitives
// -------------------------------------------------------------

// 1. TextReveal (Smooth entrance without overflow clipping)
export function TextReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 2. FadeUp (Smooth fadeUp with translation)
export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// -------------------------------------------------------------
// Data & Mockups
// -------------------------------------------------------------

// Cases & Superpowers
const caseProjects = [
  {
    num: "01",
    tag: "БОЛЬШОЕ ТО / 160 000 КМ",
    car: "KIA Rio III (Рестайлинг) 1.6 MT",
    headline: "Своевременный расчет интервала масла и заказ свечей NGK без переплат",
    savings: "14 500 ₽",
    metrics: [
      { label: "Точность подбора", value: "100%" },
      { label: "Экономия времени", value: "3 часа" },
      { label: "Артикулы Autodoc", value: "OEM Direct" },
    ],
    badges: ["Рейтинг Рунета x1", "OEM Спецификация", "Autodoc Link"],
    dialog: {
      user: "Иваныч, пробег 159 400 км. Что по регламенту делать?",
      assistant:
        "До замены моторного масла и фильтра осталось ровно 600 км. Также пора менять свечи зажигания (крайний раз меняли на 120 000 км). Подобрал оригинал Hyundai/Kia 18846-10060 и аналог NGK 1578. Кстати, фильтр Mann W81180 уже лежит у тебя в гараже — не покупай!",
    },
    partLink: "https://www.autodoc.ru/man/647/part/1884610060",
  },
  {
    num: "02",
    tag: "НЕМЕЦКИЙ ДОПУСК / BMW LL-04",
    car: "BMW 320d G20 xDrive (B47)",
    headline: "Строгий контроль допусков масел и подбор спортивных колодок Brembo",
    savings: "28 000 ₽",
    metrics: [
      { label: "Допуск масла", value: "BMW LL-04" },
      { label: "Склад гаража", value: "1 фильтр в наличии" },
      { label: "Сохранность гарантии", value: "100%" },
    ],
    badges: ["Tagline Awards x2", "Brembo Racing", "Гаражный склад"],
    dialog: {
      user: "Какие передние колодки взять, чтобы не скрипели и не пылили?",
      assistant:
        "Для твоих тормозов 348мм рекомендую комплект Brembo P06106 (с керамическим наполнителем) или оригинальные 34106888459. Датчик износа 34356870351 тоже добавь в заказ на Автодоке.",
    },
    partLink: "https://www.autodoc.ru/man/511/part/34106888459",
  },
  {
    num: "03",
    tag: "НОВЫЙ АВТО / ГАРАНТИЯ ДИЛЕРА",
    car: "Geely Monjaro 2.0T 4WD",
    headline: "Скан заказ-нарядов с камеры и сохранение всех чеков в WebP",
    savings: "19 200 ₽",
    metrics: [
      { label: "Оцифровка чека", value: "1.2 сек" },
      { label: "Формат фото", value: "WebP 1600px" },
      { label: "Статус при продаже", value: "+15% к цене" },
    ],
    badges: ["Золотой сайт x1", "Безопасное хранилище", "WebP Фото"],
    dialog: {
      user: "Зафиксируй нулевое ТО у дилера на 25 400 руб, прикрепил фото заказ-наряда",
      assistant:
        "Расход успешно внесен: ТО-0 на 25 400 ₽. Фото заказ-наряда сжато в WebP без потери четкости печатей и привязано к истории. Одометр зафиксирован: 5 120 км.",
    },
    partLink: "https://www.autodoc.ru",
  },
]

// Car brands ticker
const brandTickerRow1 = [
  "PORSCHE",
  "BMW",
  "MERCEDES-BENZ",
  "AUDI",
  "VOLKSWAGEN",
  "TOYOTA",
  "LEXUS",
  "KIA",
  "HYUNDAI",
  "GEELY",
  "HAVAL",
  "VOLVO",
  "MAZDA",
  "SUBARU",
]

const brandTickerRow2 = [
  "РЕГЛАМЕНТ ТО",
  "ПОДБОР ПО VIN",
  "СЕЗОННЫЕ ШИНЫ",
  "ОРИГИНАЛЬНЫЕ OEM-АРТИКУЛЫ",
  "ПРЯМЫЕ ССЫЛКИ НА AUTODOC",
  "ВЕБ-ЧЕКИ WEBP",
  "PDF ПАСПОРТ АВТО",
  "ГАРАЖНЫЙ СКЛАД",
  "РАСХОД ТОПЛИВА",
  "ЗАЩИТА ДАННЫХ",
]

// Features Accordion
const platformFeatures = [
  {
    idx: "01",
    title: "AI-механик Иваныч в кармане",
    short: "Знает регламент ТО, склад в гараже и подбирает запчасти по запросу",
    description:
      "Иваныч помнит одометр вашего авто, следит за межсервисными интервалами и находит точные OEM-артикулы со ссылками на Autodoc.ru. Запись расхода занимает 2 секунды — достаточно написать одну фразу в чате.",
    tags: ["AI Интеллект", "Autodoc.ru", "Умный контекст"],
  },
  {
    idx: "02",
    title: "Сезонный учет шин и колес",
    short: "Замер протектора в мм, учет летних/зимних комплектов и место хранения",
    description:
      "Больше не нужно гадать, где лежат зимние колеса и сколько миллиметров протектора осталось. Система считает пробег каждого комплекта резины и заранее подскажет, когда пора записаться на шиномонтаж.",
    tags: ["Лето / Зима", "Глубина протектора (мм)", "Место хранения"],
  },
  {
    idx: "03",
    title: "Оцифровка чеков в WebP с камеры",
    short: "Чеки не выцветают и не теряются, оптимизация размера фото на лету",
    description:
      "Сфотографируйте чек или заказ-наряд прямо на АЗС или в автосервисе. Алгоритм сжимает снимок в современный формат WebP до 1600px, сохраняя читаемость каждой цифры и печати без перегрузки памяти телефона.",
    tags: ["Камера смартфона", "Сжатие WebP", "Вечное хранение"],
  },
  {
    idx: "04",
    title: "Интерактивный PDF-паспорт для продажи",
    short: "Подтвержденная сервисная история, повышающая ликвидность авто на 10–15%",
    description:
      "В один клик сгенерируйте официальный сервисный паспорт автомобиля с графиками трат, пробегом и прикрепленными чеками. Публичная веб-страница авто вызывает безоговорочное доверие у покупателей и помогает продать авто быстрее и дороже.",
    tags: ["PDF Экспорт", "Публичная страница", "+15% к цене"],
  },
  {
    idx: "05",
    title: "Гаражный склад запчастей",
    short: "Учет уже купленных фильтров, колодок и масел на полке в гараже",
    description:
      "Иваныч знает, что лежит у вас в багажнике или на стеллаже. Когда придет время очередного ТО, он предупредит: «Кстати, масляный фильтр и 4 свечи у тебя уже куплены, заказывать нужно только масло!». Никаких лишних трат.",
    tags: ["Остатки на складе", "Предотвращение дублей", "Экономия бюджета"],
  },
  {
    idx: "06",
    title: "PWA-приложение в один клик",
    short: "Ставится на экран iPhone и Android без App Store и Google Play, работает офлайн",
    description:
      "Полноценный нативный экспириенс без ожидания модерации в маркетах. Добавьте AutoNotes на домашний экран в один клик и вносите заправки даже на трассе без стабильного интернета.",
    tags: ["iOS & Android", "Офлайн-режим", "Мгновенный запуск"],
  },
]

// Battle comparison data
const battleComparison = [
  {
    metric: "Скорость записи расхода",
    notebook: "Искать ручку, писать от руки в бардачке",
    excel: "Тяжело открывать таблицы со смартфона на морозе",
    autonote: "2 секунды в чате: «Заправился на 2500, 45л» — Иваныч сделает всё сам",
  },
  {
    metric: "Подбор запчастей и регламент",
    notebook: "Штудировать форумные ветки и отзывы",
    excel: "Ручной поиск в Google и десятки вкладок",
    autonote: "Оригиналы + надежные аналоги со ссылками на Автодок прямо в диалоге",
  },
  {
    metric: "Контроль остатка до ТО",
    notebook: "Легко забыть и проехать регламентные 10 000 км",
    excel: "Нужно вручную писать формулы одометра",
    autonote: "Иваныч автоматически обновляет одометр и напомнит за 1000 км до ТО",
  },
  {
    metric: "Сохранность чеков и заказ-нарядов",
    notebook: "Термобумага выцветает в ноль через 6 месяцев",
    excel: "Файлы фото разбросаны по галерее смартфона",
    autonote: "Авто-сжатие в WebP с камеры, четкие печати навсегда привязаны к расходу",
  },
  {
    metric: "Продажа автомобиля на вторичке",
    notebook: "Словам без документов покупатели не верят",
    excel: "Самодельная табличка выглядит сомнительно",
    autonote: "Фирменный PDF-паспорт и публичная веб-страница авто (+15% к стоимости)",
  },
]

// -------------------------------------------------------------
// Main Component (Clean Light Aesthetic)
// -------------------------------------------------------------

export function LandingPage() {
  const isAuthed = useAuthStore((s) => !!s.accessToken)

  // Ensure documentElement has light background and no dark class while on landing page
  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  // Interactive Live Demo in Cockpit
  const [demoInput, setDemoInput] = useState("")
  const [demoMessages, setDemoMessages] = useState<
    Array<{ sender: "user" | "ivanych"; text: string; link?: string; linkText?: string }>
  >([
    {
      sender: "ivanych",
      text: "Здорово! Я Иваныч, твой персональный AI-механик. Слежу за регламентом, одометром и складом твоего автомобиля. Спроси меня про запчасти или напиши свежий расход!",
    },
    {
      sender: "user",
      text: "Иваныч, нужны передние тормозные колодки на KIA Rio 1.6. Что взять качественное?",
    },
    {
      sender: "ivanych",
      text: "Держи проверенный вариант: Sangsin Brake SP1399 — отличные корейские колодки, не скрипят и берегут тормозной диск. Либо заводской оригинал Hyundai/Kia 58101-4LA00. Заказная ссылка на Автодоке уже готова!",
      link: "https://www.autodoc.ru/man/5315/part/sp1399",
      linkText: "Посмотреть Sangsin SP1399 на Autodoc.ru ↗",
    },
  ])

  // Dedicated ref to smoothly scroll chat messages without shifting page layout
  const chatScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [demoMessages])

  // Feature accordion open state
  const [openFeatureIdx, setOpenFeatureIdx] = useState<string>("01")

  // Quick action presets for demo (Smoothly appends without layout shift)
  const handleQuickAction = (text: string, reply: string, link?: string, linkText?: string) => {
    setDemoMessages((prev) => [
      ...prev,
      { sender: "user", text },
      { sender: "ivanych", text: reply, link, linkText },
    ])
  }

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoInput.trim()) return

    const query = demoInput.trim()
    setDemoInput("")

    let reply = "Принял в обработку! Зафиксировал в бортовом журнале твоего авто."
    let link: string | undefined = undefined
    let linkText: string | undefined = undefined

    if (query.toLowerCase().includes("масло") || query.toLowerCase().includes("то")) {
      reply =
        "По регламенту твоего мотора 1.6 рекомендую масло с допуском ACEA A5/B5 или API SP (вязкость 5W-30). До следующей замены осталось 600 км. Масляный фильтр Mann W81180 уже есть на твоем складе в гараже!"
      link = "https://www.autodoc.ru/man/4/part/w81180"
      linkText = "Mann W81180 на Autodoc.ru ↗"
    } else if (query.toLowerCase().includes("свеч")) {
      reply =
        "Свечи зажигания по регламенту меняются каждые 30 000 км. Отличный проверенный комплект — иридиевые NGK LZKR6B-10E (арт. 1578). Записал артикул!"
      link = "https://www.autodoc.ru/man/15/part/1578"
      linkText = "Свечи NGK 1578 на Autodoc.ru ↗"
    } else if (query.toLowerCase().includes("заправ") || query.toLowerCase().includes("руб")) {
      reply =
        "✅ Расход зафиксирован: Топливо АИ-95, средний расход пересчитан. Одометр обновлен в бортовой базе данных!"
    }

    setDemoMessages((prev) => [
      ...prev,
      { sender: "user", text: query },
      { sender: "ivanych", text: reply, link, linkText },
    ])
  }

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect to dashboard if logged in inside installed standalone PWA or on app domain
  if (isAuthed && (isStandalone || isAppDomain())) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    // Clean, crisp, modern LIGHT aesthetic
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Ambient soft top radial glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(226,232,240,0.7),transparent_100%)]" />

      {/* ============================================================ */}
      {/* 00 / FLOATING CAPSULE HEADER (LIGHT LUXURY)                  */}
      {/* ============================================================ */}
      <header className="fixed top-5 left-0 right-0 z-50 pointer-events-none">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 flex items-center justify-between">
          
          {/* Unified Floating Island Bar */}
          <div className="pointer-events-auto w-full flex items-center justify-between rounded-full border border-slate-200/90 bg-white/90 px-4 sm:px-6 py-2 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
            
            {/* Left: Branding */}
            <a href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-mono font-black group-hover:bg-slate-800 transition-colors shadow-sm">
                AN
              </span>
              <span className="text-sm font-extrabold uppercase tracking-wider text-slate-900">AutoNotes</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-mono text-emerald-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI LIVE
              </span>
            </a>

            {/* Center: Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <a href="#ivanych" className="rounded-full px-4 py-2 transition-colors hover:bg-slate-100 hover:text-slate-950">
                01 Кейсы
              </a>
              <a href="#expertise" className="rounded-full px-4 py-2 transition-colors hover:bg-slate-100 hover:text-slate-950">
                02 Экспертиза
              </a>
              <a href="#features" className="rounded-full px-4 py-2 transition-colors hover:bg-slate-100 hover:text-slate-950">
                03 Возможности
              </a>
              <a href="#battle" className="rounded-full px-4 py-2 transition-colors hover:bg-slate-100 hover:text-slate-950">
                04 Баттл
              </a>
            </nav>

            {/* Right: Action Button & Mobile toggle */}
            <div className="flex items-center gap-2">
              <Link
                to={isAuthed ? "/dashboard" : "/register"}
                className="group flex h-9 sm:h-11 items-center gap-2 sm:gap-2.5 rounded-full bg-slate-900 px-3.5 sm:px-6 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white transition-all duration-300 hover:bg-slate-800 active:scale-95 shadow-md whitespace-nowrap shrink-0"
              >
                <span>
                  {isAuthed ? (
                    "В гараж"
                  ) : (
                    <>
                      <span className="hidden sm:inline">Открыть гараж</span>
                      <span className="sm:hidden">В гараж</span>
                    </>
                  )}
                </span>
                <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-white text-slate-950 transition-transform duration-300 group-hover:rotate-45 shrink-0">
                  <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </div>
              </Link>

              {/* Mobile Menu trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:text-slate-950 ml-1"
                aria-label="Меню"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto md:hidden w-[calc(100%-2rem)] max-w-md mx-auto mt-2 rounded-3xl border border-slate-200 bg-white/95 p-6 backdrop-blur-2xl shadow-xl"
            >
              <div className="flex flex-col gap-4 text-sm font-medium">
                <a
                  href="#ivanych"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-slate-700 hover:text-slate-950 py-1.5 border-b border-slate-100"
                >
                  <span>01 / Кейсы и Иваныч</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
                <a
                  href="#expertise"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-slate-700 hover:text-slate-950 py-1.5 border-b border-slate-100"
                >
                  <span>02 / Экспертиза и Бренды</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-slate-700 hover:text-slate-950 py-1.5 border-b border-slate-100"
                >
                  <span>03 / Возможности экосистемы</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
                <a
                  href="#battle"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-slate-700 hover:text-slate-950 py-1.5 border-b border-slate-100"
                >
                  <span>04 / Баттл: Блокнот vs Excel</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
                <div className="pt-2">
                  <Link
                    to={isAuthed ? "/dashboard" : "/register"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 w-full items-center justify-center rounded-full bg-slate-900 text-xs font-bold uppercase tracking-wider text-white shadow-md"
                  >
                    {isAuthed ? "Перейти в гараж" : "Открыть гараж бесплатно"}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================ */}
      {/* 01 / HERO INTRO SECTION (LIGHT CLEAN SCALE)                  */}
      {/* ============================================================ */}
      <section className="relative min-h-screen pt-32 sm:pt-40 pb-20 flex flex-col justify-between overflow-hidden">
        
        {/* Soft Monolithic Watermark Background */}
        <div className="pointer-events-none absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 select-none z-0 opacity-[0.04] whitespace-nowrap">
          <span className="text-[18vw] font-black tracking-tighter leading-none text-slate-900 block">
            AUTONOTES
          </span>
        </div>

        <div className="relative z-10 w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 flex-1 flex flex-col justify-between">
          
          {/* Top Info Bar (Automotive telemetry status) */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-slate-200">
            <FadeUp delay={0.1}>
              <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ассистент Иваныч: <strong className="text-slate-950 font-semibold">Онлайн</strong></span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-2 text-slate-400">
                  <span>•</span>
                  <span>Регламенты 100+ мировых марок</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-2 text-slate-400">
                  <span>•</span>
                  <span>Подбор OEM-артикулов и запчастей</span>
                </span>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="flex items-baseline gap-4 lg:text-right">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-mono">
                  99.8%
                </span>
                <p className="text-xs sm:text-sm text-slate-500 max-w-[260px] leading-snug">
                  Точность подбора OEM-артикулов и регламентов ТО по маркам
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Monumental Headlines */}
          <div className="py-12 sm:py-20">
            <TextReveal delay={0.15}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[88px] xl:text-[100px] font-black tracking-[-0.04em] leading-[0.98] text-slate-950 uppercase">
                ТЕЛЕМЕТРИЯ АВТОМОБИЛЯ
              </h1>
            </TextReveal>
            <TextReveal delay={0.3}>
              <div className="text-3xl sm:text-5xl md:text-6xl lg:text-[72px] xl:text-[86px] font-black tracking-[-0.04em] leading-[1.02] text-slate-400 uppercase mt-2">
                С ЛИЧНЫМ AI-МЕХАНИКОМ{" "}
                <span className="text-slate-950 underline decoration-amber-500/70 underline-offset-8">
                  ИВАНЫЧЕМ
                </span>
              </div>
            </TextReveal>
            
            <FadeUp delay={0.4} className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6 max-w-3xl">
              <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal">
                Забудьте о блокнотах и громоздких таблицах. Фиксируйте заправки за 2 секунды текстом в чате, 
                находите проверенные запчасти со ссылками на Автодок и держите регламент под контролем.
              </p>
              <div className="shrink-0">
                <Link
                  to={isAuthed ? "/dashboard" : "/register"}
                  className="inline-flex h-14 items-center gap-3 rounded-full bg-slate-950 px-8 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-slate-800 active:scale-95 shadow-xl"
                >
                  <span>{isAuthed ? "В гараж" : "Начать бесплатно"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeUp>
          </div>

          {/* Full-Bleed Showcase Module (HUD Telemetry & Live Interactive Terminal) */}
          {/* Note: NO confusing "00", NO blur overlay, FIXED height with smooth scroll (zero content jitter) */}
          <FadeUp delay={0.5} className="w-full relative">
            <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative">
              
              {/* Header inside showcase */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-mono font-semibold">
                      БОРТОВОЙ КОМПЬЮТЕР И ДИАЛОГ С ИВАНЫЧЕМ
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-950 flex items-center gap-2">
                      <span>KIA Rio III Рестайлинг 1.6 MT</span>
                      <span className="text-xs font-normal text-slate-400 font-mono">| Одометр: 159 400 км</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-mono text-emerald-700 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    РЕГЛАМЕНТ АКТИВЕН
                  </span>
                </div>
              </div>

              {/* Cockpit Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                
                {/* Left: Telemetry Gauges (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                  
                  {/* Oil Gauge */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-700 mb-3">
                      <span className="flex items-center gap-2 font-mono uppercase tracking-wider font-semibold">
                        <Fuel className="h-4 w-4 text-amber-500" />
                        Моторное масло 5W-30
                      </span>
                      <span className="font-mono text-amber-600 font-bold">Осталось 600 км</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "94%" }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-2">
                      <span>Замена: 150 000 км</span>
                      <span>Регламент: 160 000 км</span>
                    </div>
                  </div>

                  {/* Tires Gauge */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-700 mb-3">
                      <span className="flex items-center gap-2 font-mono uppercase tracking-wider font-semibold">
                        <Disc className="h-4 w-4 text-emerald-600" />
                        Комплект: Continental PremiumContact 6
                      </span>
                      <span className="font-mono text-emerald-600 font-bold">6.8 мм</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400">ПЛ</div>
                        <div className="font-bold text-slate-900">6.8 мм</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400">ПР</div>
                        <div className="font-bold text-slate-900">6.8 мм</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400">ЗЛ</div>
                        <div className="font-bold text-slate-900">7.2 мм</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-400">ЗР</div>
                        <div className="font-bold text-slate-900">7.2 мм</div>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse alert (100% visible, not blurry) */}
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 flex items-start gap-3">
                    <Boxes className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-sky-800">Гаражный склад:</span> На стеллаже найден масляный фильтр{" "}
                      <span className="font-mono font-semibold text-slate-950">Mann W81180</span>. Иваныч учтет это при расчете сметы!
                    </div>
                  </div>

                </div>

                {/* Right: Live Interactive Terminal (7 cols) with STABLE FIXED HEIGHT (No Content Shifting) */}
                <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 shadow-inner">
                  
                  {/* Messages Feed with strictly fixed height & reserved scroll gutter (ZERO jumping) */}
                  <div
                    ref={chatScrollRef}
                    className="h-[280px] overflow-y-scroll [scrollbar-gutter:stable] pr-2 space-y-3"
                  >
                    {demoMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.sender === "ivanych" && (
                          <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-slate-300 bg-slate-200 shadow-2xs">
                            <img
                              src="/avatars/ivanych.webp"
                              alt="Иваныч"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none"
                              }}
                            />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                            msg.sender === "user"
                              ? "bg-slate-900 text-white font-medium rounded-tr-sm shadow-sm"
                              : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm space-y-2 shadow-2xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          {msg.link && (
                            <a
                              href={msg.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 underline decoration-sky-400/40"
                            >
                              <span>{msg.linkText || "Открыть на Autodoc.ru"}</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action Pills (Fixed position, never moves) */}
                  <div className="pt-3 border-t border-slate-200 mt-3">
                    <div className="text-[11px] text-slate-500 font-mono mb-2 font-semibold">БЫСТРЫЙ ТЕСТ-ДРАЙВ:</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAction(
                            "Иваныч, какое масло залить в мотор?",
                            "Для мотора 1.6 Gamma заливай 5W-30 с допуском ACEA A5/B5 (объем 3.3 л). Отличный выбор — Total Quartz 9000 или Лукойл Genesis Armortech HK.",
                            "https://www.autodoc.ru",
                            "Масла 5W-30 на Autodoc ↗"
                          )
                        }
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 transition-colors shadow-2xs"
                      >
                        🛢️ Какое масло лить?
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAction(
                            "Заправил 42 литра АИ-95 на 2400 руб, пробег 159 400",
                            "✅ Зафиксировал: Заправка 42 л на 2 400 ₽ (57.14 ₽/л). Одометр обновлен: 159 400 км. Средний расход: 7.4 л / 100 км."
                          )
                        }
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 transition-colors shadow-2xs"
                      >
                        ⛽ Заправил 42 литра АИ-95
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAction(
                            "Подскажи артикул свечей зажигания",
                            "Оригинальные свечи Hyundai/Kia 18846-10060 либо японские NGK 1578 (LZKR6B-10E). Комплект из 4 шт. уже ждет на Автодоке.",
                            "https://www.autodoc.ru/man/15/part/1578",
                            "Свечи NGK 1578 на Autodoc ↗"
                          )
                        }
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 transition-colors shadow-2xs"
                      >
                        ⚡ Артикул свечей
                      </button>
                    </div>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleCustomSend} className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                    <input
                      type="text"
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      placeholder="Напишите Иванычу: «Заправился на 2000р» или «Какие колодки взять?»..."
                      className="flex-1 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 transition-colors shadow-2xs"
                    />
                    <button
                      type="submit"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0 shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>

                </div>

              </div>

            </div>
          </FadeUp>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 02 / SECTION 1: [ 1 ] КЕЙСЫ И СВЕРХСПОСОБНОСТИ ИВАНЫЧА      */}
      {/* ============================================================ */}
      <section id="ivanych" className="py-24 sm:py-36 border-t border-slate-200">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 bg-white font-mono text-lg font-bold text-slate-950 shadow-sm">
                1
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-semibold">
                КЕЙСЫ И СВЕРХСПОСОБНОСТИ
              </span>
            </div>
          </FadeUp>

          <TextReveal delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] text-slate-950 uppercase max-w-5xl leading-[1.05]">
              ОРИЕНТИРОВАНЫ НА РЕЗУЛЬТАТ И ДОКАЗЫВАЕМ ЭТО НА ВАШЕМ АВТО
            </h2>
          </TextReveal>

          <FadeUp delay={0.2} className="mt-4 text-base sm:text-xl text-slate-600 font-normal max-w-3xl">
            25+ лет практического опыта автомеханика оцифрованы в базе знаний. Иваныч не просто ведет учет трат — 
            он бережет ваш автомобиль и бюджет от навязанных сервисных услуг.
          </FadeUp>

          {/* Large Project Showcase Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 sm:mt-20">
            {caseProjects.map((project, idx) => (
              <FadeUp key={idx} delay={0.15 * idx} className="h-full">
                <div className="group h-full flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 transition-all duration-500 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] shadow-sm">
                  
                  <div>
                    {/* Top Row: Number & Tag */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                      <span className="font-mono text-2xl font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                        {project.num}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono text-slate-600 font-medium">
                        {project.tag}
                      </span>
                    </div>

                    {/* Car Model & Headline */}
                    <div className="mt-6">
                      <div className="text-xs font-mono uppercase tracking-wider text-amber-600 font-bold">
                        {project.car}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mt-2 leading-snug">
                        {project.headline}
                      </h3>
                    </div>

                    {/* Badges List */}
                    <div className="flex flex-wrap gap-2 mt-6">
                      {project.badges.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700 font-medium"
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    {/* Dialog Sample */}
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-slate-900">Владелец:</span> «{project.dialog.user}»
                      </div>
                      <div className="text-xs text-slate-800 leading-relaxed border-t border-slate-200/80 pt-3">
                        <span className="font-bold text-amber-600">Иваныч:</span> {project.dialog.assistant}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Metrics & Action */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">ЭКОНОМИЯ НА ТО</div>
                      <div className="text-2xl font-black font-mono text-emerald-600">{project.savings}</div>
                    </div>
                    <a
                      href={project.partLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all group-hover:bg-slate-900 group-hover:text-white"
                      aria-label="Прямая ссылка"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </a>
                  </div>

                </div>
              </FadeUp>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 03 / SECTION 2: [ 2 ] ЭКСПЕРТИЗА И ТЕХНОЛОГИИ                */}
      {/* ============================================================ */}
      <section id="expertise" className="py-24 sm:py-36 border-t border-slate-200 overflow-hidden">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 bg-white font-mono text-lg font-bold text-slate-950 shadow-sm">
                2
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-semibold">
                ЭКСПЕРТИЗА И ТЕХНОЛОГИИ
              </span>
            </div>
          </FadeUp>

          <TextReveal delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] text-slate-950 uppercase max-w-5xl leading-[1.05]">
              БАЗА ДАННЫХ ПО РЕГЛАМЕНТАМ И ДОПУСКАМ ВЕДУЩИХ АВТОКОНЦЕРНОВ
            </h2>
          </TextReveal>

          {/* Metric Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 sm:mt-20">
            <FadeUp delay={0.1}>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="text-4xl sm:text-6xl font-black font-mono text-slate-950">24/7</div>
                <div className="text-xs sm:text-sm text-slate-600 mt-3 font-medium">
                  Иваныч на связи без очередей, выходных и перерывов
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="text-4xl sm:text-6xl font-black font-mono text-slate-950">2 сек</div>
                <div className="text-xs sm:text-sm text-slate-600 mt-3 font-medium">
                  На фиксацию заправки или сервиса одной строкой в чате
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="text-4xl sm:text-6xl font-black font-mono text-emerald-600">0 ₽</div>
                <div className="text-xs sm:text-sm text-slate-600 mt-3 font-medium">
                  Переплат за ненужные навязанные работы в автосервисах
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="text-4xl sm:text-6xl font-black font-mono text-slate-950">100%</div>
                <div className="text-xs sm:text-sm text-slate-600 mt-3 font-medium">
                  Конфиденциальность чеков и привязка к вашему гаражу
                </div>
              </div>
            </FadeUp>
          </div>

        </div>

        {/* Cloudmill Infinite Marquee Ticker */}
        <div className="mt-20 sm:mt-28 space-y-4">
          
          {/* Ticker Line 1: Auto Brands */}
          <div className="relative w-full overflow-hidden whitespace-nowrap py-3.5 border-y border-slate-200 bg-slate-100/90">
            <div className="flex animate-marquee gap-8 text-xl sm:text-2xl font-black tracking-widest text-slate-400 uppercase font-mono">
              {[...brandTickerRow1, ...brandTickerRow1].map((brand, i) => (
                <span key={i} className="flex items-center gap-8">
                  <span>{brand}</span>
                  <span className="text-slate-300">•</span>
                </span>
              ))}
            </div>
          </div>

          {/* Ticker Line 2: Systems & Features */}
          <div className="relative w-full overflow-hidden whitespace-nowrap py-3.5 border-b border-slate-200 bg-white">
            <div
              className="flex gap-8 text-xl sm:text-2xl font-black tracking-widest text-slate-700 uppercase font-mono"
              style={{ animation: "marquee 32s linear infinite reverse" }}
            >
              {[...brandTickerRow2, ...brandTickerRow2].map((feat, i) => (
                <span key={i} className="flex items-center gap-8">
                  <span className="text-slate-950 font-bold">{feat}</span>
                  <span className="text-slate-300">—</span>
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 04 / SECTION 3: [ 3 ] ВОЗМОЖНОСТИ ЭКОСИСТЕМЫ                 */}
      {/* ============================================================ */}
      <section id="features" className="py-24 sm:py-36 border-t border-slate-200">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 bg-white font-mono text-lg font-bold text-slate-950 shadow-sm">
                3
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-semibold">
                ВОЗМОЖНОСТИ ПЛАТФОРМЫ
              </span>
            </div>
          </FadeUp>

          <TextReveal delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] text-slate-950 uppercase max-w-5xl leading-[1.05]">
              ЭКОСИСТЕМА ДЛЯ ТЕХ, КТО ЛЮБИТ И ЦЕНИТ СВОЙ АВТОМОБИЛЬ
            </h2>
          </TextReveal>

          {/* Interactive Accordion List */}
          <div className="mt-16 sm:mt-24 border-t border-slate-200">
            {platformFeatures.map((feat) => {
              const isOpen = openFeatureIdx === feat.idx
              return (
                <div
                  key={feat.idx}
                  className="border-b border-slate-200 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFeatureIdx(isOpen ? "" : feat.idx)}
                    className="w-full py-6 sm:py-8 md:py-10 flex items-center justify-between text-left group gap-4"
                  >
                    <div className="flex items-baseline gap-4 sm:gap-8 md:gap-10 min-w-0 pr-2">
                      <span className="font-mono text-base sm:text-2xl font-bold text-slate-400 group-hover:text-slate-950 transition-colors shrink-0">
                        {feat.idx}
                      </span>
                      <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 group-hover:text-slate-700 transition-colors">
                        {feat.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="hidden lg:inline-block text-xs font-mono text-slate-500">
                        {feat.short}
                      </span>
                      <div
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-transform duration-300 ${
                          isOpen ? "rotate-45 bg-slate-100" : "group-hover:rotate-45"
                        } shadow-2xs shrink-0`}
                      >
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-10 pl-12 sm:pl-16 md:pl-20 max-w-4xl space-y-6">
                          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                            {feat.description}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {feat.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono text-slate-700 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 05 / SECTION 4: [ 4 ] ЧЕСТНЫЙ БАТТЛ                          */}
      {/* ============================================================ */}
      <section id="battle" className="py-24 sm:py-36 border-t border-slate-200">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 bg-white font-mono text-lg font-bold text-slate-950 shadow-sm">
                4
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-semibold">
                ЧЕСТНЫЙ БАТТЛ
              </span>
            </div>
          </FadeUp>

          <TextReveal delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] text-slate-950 uppercase max-w-5xl leading-[1.05]">
              ПОЧЕМУ AUTONOTES С ИВАНЫЧЕМ ПОБЕЖДАЕТ БЛОКНОТ И EXCEL
            </h2>
          </TextReveal>

          {/* 3-Column Split Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 sm:mt-24">
            
            {/* Card 1: Paper Notebook */}
            <FadeUp delay={0.1}>
              <div className="h-full rounded-3xl border border-slate-200 bg-slate-50/90 p-8 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity shadow-2xs">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                    <span className="text-xs uppercase font-mono text-slate-400 font-semibold">СТАРЫЙ МЕТОД</span>
                    <span className="text-xs font-mono text-rose-600 font-bold">01 / БЛОКНОТ</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-950 mt-6">Бумажная тетрадь в бардачке</h3>
                  <div className="mt-8 space-y-6">
                    {battleComparison.map((row, i) => (
                      <div key={i} className="text-xs sm:text-sm space-y-1">
                        <div className="text-slate-400 font-mono text-[11px] font-semibold">{row.metric}:</div>
                        <div className="text-slate-600 flex items-start gap-2">
                          <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>{row.notebook}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 font-mono">
                  Итог: чеки выцветают, одометр забывается
                </div>
              </div>
            </FadeUp>

            {/* Card 2: Excel Spreadsheet */}
            <FadeUp delay={0.2}>
              <div className="h-full rounded-3xl border border-slate-200 bg-slate-50/90 p-8 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity shadow-2xs">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                    <span className="text-xs uppercase font-mono text-slate-400 font-semibold">СЛОЖНЫЙ МЕТОД</span>
                    <span className="text-xs font-mono text-amber-600 font-bold">02 / EXCEL</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-950 mt-6">Таблицы со смартфона</h3>
                  <div className="mt-8 space-y-6">
                    {battleComparison.map((row, i) => (
                      <div key={i} className="text-xs sm:text-sm space-y-1">
                        <div className="text-slate-400 font-mono text-[11px] font-semibold">{row.metric}:</div>
                        <div className="text-slate-600 flex items-start gap-2">
                          <X className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{row.excel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 font-mono">
                  Итог: 80% водителей бросают вести через 2 месяца
                </div>
              </div>
            </FadeUp>

            {/* Card 3: AutoNotes Dominator */}
            <FadeUp delay={0.3}>
              <div className="h-full rounded-3xl border-2 border-slate-950 bg-white p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <span className="text-xs uppercase font-mono text-emerald-600 font-bold">ЦИФРОВОЙ СТАНДАРТ</span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-300 px-3 py-0.5 text-xs font-mono text-emerald-700 font-semibold">
                      03 / AUTONOTES
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-6 flex items-center gap-2">
                    <span>AutoNotes & Иваныч</span>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </h3>
                  <div className="mt-8 space-y-6">
                    {battleComparison.map((row, i) => (
                      <div key={i} className="text-xs sm:text-sm space-y-1">
                        <div className="text-slate-400 font-mono text-[11px] font-semibold">{row.metric}:</div>
                        <div className="text-slate-900 font-semibold flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{row.autonote}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link
                    to={isAuthed ? "/dashboard" : "/register"}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 text-xs font-extrabold uppercase tracking-wider text-white transition-transform hover:scale-[1.02] active:scale-95 shadow-md"
                  >
                    <span>Выбрать AutoNotes</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

              </div>
            </FadeUp>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 06 / MONUMENTAL CONTRAST CTA BANNER & CLEAN LIGHT FOOTER     */}
      {/* ============================================================ */}
      <footer id="contacts" className="pt-20 pb-16 border-t border-slate-200 relative overflow-hidden bg-white">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          {/* Monumental Contrast CTA Block (Striking deep jet black in light page) */}
          <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-14 lg:p-20 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-4xl">
              <TextReveal>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-4 font-semibold">
                  [ 05 / СТАРТ РАБОТЫ ]
                </div>
              </TextReveal>
              <TextReveal delay={0.1}>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-white uppercase leading-[1.02]">
                  ГОТОВЫ ПЕРЕВЕСТИ СВОЙ АВТОМОБИЛЬ В ЦИФРУ?
                </h2>
              </TextReveal>
              <FadeUp delay={0.2} className="mt-6 text-base sm:text-xl text-slate-300 font-light max-w-2xl">
                Запустите гараж за 30 секунд. Иваныч сразу считает ваш регламент по марке и пробегу, 
                подберет запчасти и сохранит историю навсегда.
              </FadeUp>

              <FadeUp delay={0.3} className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to={isAuthed ? "/dashboard" : "/register"}
                  className="group flex h-16 items-center gap-4 rounded-full bg-white px-9 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950 transition-all hover:bg-slate-100 active:scale-95 shadow-2xl"
                >
                  <span>{isAuthed ? "Перейти в гараж" : "Запустить гараж с Иванычем"}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white transition-transform group-hover:rotate-45">
                    <Plus className="h-4 w-4" />
                  </div>
                </Link>
              </FadeUp>
            </div>

            {/* Watermark in CTA */}
            <div className="pointer-events-none absolute -bottom-10 -right-10 select-none opacity-[0.04]">
              <span className="text-[20vw] font-black tracking-tighter text-white">AN</span>
            </div>
          </div>

          {/* Clean Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-16 pt-12 border-t border-slate-200 text-xs sm:text-sm">
            
            {/* Col 1: Brand & Clean Description */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2.5 font-bold tracking-tight text-slate-950 text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white font-mono text-xs">
                  AN
                </span>
                <span>AutoNotes</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-md">
                Цифровой гараж и бортовой ассистент автолюбителя. Учет расходов, регламент ТО, склад запчастей и сезонный контроль шин.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <div className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">НАВИГАЦИЯ</div>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li>
                  <a href="#ivanych" className="hover:text-slate-950 transition-colors">
                    01 / Кейсы и Иваныч
                  </a>
                </li>
                <li>
                  <a href="#expertise" className="hover:text-slate-950 transition-colors">
                    02 / Экспертиза и Бренды
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-slate-950 transition-colors">
                    03 / Возможности экосистемы
                  </a>
                </li>
                <li>
                  <a href="#battle" className="hover:text-slate-950 transition-colors">
                    04 / Честный Баттл
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Scroll to Top & Copyright */}
            <div className="flex flex-col justify-between items-start md:items-end space-y-4">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-mono font-medium text-slate-700 hover:border-slate-400 hover:text-slate-950 transition-all shadow-2xs"
              >
                <span>Наверх</span>
                <ArrowRight className="h-3.5 w-3.5 -rotate-90 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <div className="text-[11px] text-slate-400 font-mono">
                &copy; {new Date().getFullYear()} AutoNotes. Все права защищены.
              </div>
            </div>

          </div>

        </div>
      </footer>

    </div>
  )
}
