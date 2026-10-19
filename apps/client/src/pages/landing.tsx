import { useState } from "react"
import { Navigate } from "react-router-dom"
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

const APP_DOMAIN = "my.auto-notes.ru"

function isAppDomain() {
  const h = window.location.hostname
  return h === APP_DOMAIN || h === "localhost" || h === "127.0.0.1"
}

function appUrl(path: string) {
  if (isAppDomain()) return path
  return `https://${APP_DOMAIN}${path}`
}

// -------------------------------------------------------------
// Cloudmill Signature Animation Primitives
// -------------------------------------------------------------

// 1. TextReveal (exact Cloudmill text skew and unroll with mask)
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
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: "130%", skewY: 5, scaleX: 0.97 }}
        whileInView={{ opacity: 1, y: 0, skewY: 0, scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 1.05,
          delay,
          ease: [0.22, 1, 0.36, 1], // Signature Cloudmill cubic-bezier curve
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// 2. FadeUp (Cloudmill smooth fadeUp with 80px translation)
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
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.95,
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
    partLink: "https://www.autodoc.ru/price/0/1884610060",
    partName: "Свеча зажигания NGK LZKR6B-10E",
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
    partLink: "https://www.autodoc.ru/price/0/34106888459",
    partName: "Комплект колодок Brembo P06106",
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
    partName: "Официальный регламент ТО Geely",
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
    tags: ["Gemini AI", "Autodoc.ru", "Умный контекст"],
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
// Component
// -------------------------------------------------------------

export function LandingPage() {
  const isAuthed = useAuthStore((s) => !!s.accessToken)

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
      link: "https://www.autodoc.ru/price/0/SP1399",
      linkText: "Посмотреть Sangsin SP1399 на Autodoc.ru ↗",
    },
  ])

  // Feature accordion open state
  const [openFeatureIdx, setOpenFeatureIdx] = useState<string>("01")

  // Quick action presets for demo
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
      link = "https://www.autodoc.ru/price/0/W81180"
      linkText = "Mann W81180 на Autodoc.ru ↗"
    } else if (query.toLowerCase().includes("свеч")) {
      reply =
        "Свечи зажигания по регламенту меняются каждые 30 000 км. Отличный проверенный комплект — иридиевые NGK LZKR6B-10E (арт. 1578). Записал артикул!"
      link = "https://www.autodoc.ru/price/0/1578"
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

  // Redirect if logged in on app domain
  if (isAuthed && isAppDomain()) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white selection:bg-white selection:text-black font-sans antialiased overflow-x-hidden">
      {/* ============================================================ */}
      {/* 00 / FLOATING PILL ISLAND HEADER (CLOUDMILL REPLICA)         */}
      {/* ============================================================ */}
      <header className="fixed top-5 left-0 right-0 z-50 pointer-events-none">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 flex items-center justify-between">
          
          {/* Left Block: Communication Circles (52x52) */}
          <div className="pointer-events-auto hidden lg:flex items-center gap-3">
            <a
              href="https://t.me/AutoNotesBot"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="group flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/10 bg-[#0B0B0B]/90 backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-white/5 active:scale-95 shadow-xl"
            >
              <svg width="20" height="20" viewBox="0 0 52 52" fill="none">
                <path
                  d="m18.104 25.033 10.722-4.453a441 441 0 0 1 4.647-1.948s1.657-.649 1.519.928c-.046.65-.414 2.922-.782 5.38l-1.15 7.281s-.093 1.067-.875 1.252c-.783.186-2.071-.649-2.301-.834-.184-.14-3.451-2.227-4.648-3.247-.322-.278-.69-.835.046-1.484a176 176 0 0 0 4.832-4.638c.552-.556 1.104-1.855-1.196-.278l-6.489 4.406s-.736.464-2.117.046c-1.38-.417-2.99-.974-2.99-.974s-1.105-.695.782-1.437"
                  fill="#53C9FF"
                />
              </svg>
            </a>
            <a
              href="mailto:info@auto-notes.ru"
              aria-label="Email"
              className="group flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/10 bg-[#0B0B0B]/90 backdrop-blur-xl text-white/80 transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/5 active:scale-95 shadow-xl"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          </div>

          {/* Center Block: Capsule Navigation Menu (h-14) */}
          <nav className="pointer-events-auto mx-auto lg:mx-0 flex h-14 items-center gap-1.5 rounded-full border border-white/10 bg-[#0B0B0B]/90 px-4 sm:px-6 backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)]">
            <a href="/" className="mr-3 sm:mr-6 flex items-center gap-2.5 font-bold tracking-tight text-white group">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xs font-mono font-black group-hover:border-white/50 transition-colors">
                AN
              </span>
              <span className="text-sm font-extrabold uppercase tracking-wider">AutoNotes</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI LIVE
              </span>
            </a>

            <div className="hidden md:flex items-center gap-1 text-xs font-medium text-white/60">
              <a href="#ivanych" className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/5 hover:text-white">
                01 Кейсы
              </a>
              <a href="#expertise" className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/5 hover:text-white">
                02 Экспертиза
              </a>
              <a href="#features" className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/5 hover:text-white">
                03 Возможности
              </a>
              <a href="#battle" className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/5 hover:text-white">
                04 Баттл
              </a>
              <a href="#contacts" className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/5 hover:text-white">
                Контакты
              </a>
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:text-white ml-1"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </nav>

          {/* Right Block: Inverted Pill Button with Plus/Arrow */}
          <div className="pointer-events-auto hidden sm:flex items-center gap-3">
            <a
              href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}
              className="group flex h-14 items-center gap-3 rounded-full bg-white px-7 text-xs font-extrabold uppercase tracking-wider text-black transition-all duration-300 hover:bg-neutral-200 active:scale-95 shadow-xl"
            >
              <span>{isAuthed ? "В гараж" : "Открыть гараж"}</span>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-45">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </a>
          </div>

        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-auto md:hidden w-[calc(100%-2rem)] max-w-md mx-auto mt-2 rounded-3xl border border-white/10 bg-[#0B0B0B]/95 p-6 backdrop-blur-2xl shadow-2xl"
            >
              <div className="flex flex-col gap-4 text-sm font-medium">
                <a
                  href="#ivanych"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-white/80 hover:text-white py-1 border-b border-white/5"
                >
                  <span>01 / Кейсы и Иваныч</span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </a>
                <a
                  href="#expertise"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-white/80 hover:text-white py-1 border-b border-white/5"
                >
                  <span>02 / Экспертиза и Бренды</span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-white/80 hover:text-white py-1 border-b border-white/5"
                >
                  <span>03 / Возможности экосистемы</span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </a>
                <a
                  href="#battle"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-white/80 hover:text-white py-1 border-b border-white/5"
                >
                  <span>04 / Баттл: Блокнот vs Excel</span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </a>
                <a
                  href="#contacts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-white/80 hover:text-white py-1"
                >
                  <span>05 / Контакты и доступ</span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </a>
                <div className="pt-3">
                  <a
                    href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-white text-xs font-bold uppercase tracking-wider text-black"
                  >
                    {isAuthed ? "Перейти в гараж" : "Открыть гараж бесплатно"}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ============================================================ */}
      {/* 01 / HERO INTRO SECTION (FULL-SCALE CLOUDMILL AESTHETIC)     */}
      {/* ============================================================ */}
      <section className="relative min-h-screen pt-32 sm:pt-40 pb-20 flex flex-col justify-between overflow-hidden">
        
        {/* Giant Monolithic Watermark Background (Cloudmill signature) */}
        <div className="pointer-events-none absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 select-none z-0 opacity-[0.035] whitespace-nowrap">
          <span className="text-[18vw] font-black tracking-tighter leading-none text-white block">
            AUTONOTES
          </span>
        </div>

        <div className="relative z-10 w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 flex-1 flex flex-col justify-between">
          
          {/* Top Info Bar (Cloudmill About Row) */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/5">
            <FadeUp delay={0.1}>
              <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-xs sm:text-sm text-white/60">
                <a
                  href="mailto:info@auto-notes.ru"
                  className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
                >
                  info@auto-notes.ru
                </a>
                <a
                  href="https://t.me/AutoNotesBot"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4"
                >
                  Telegram: @AutoNotesBot
                </a>
                <span className="flex items-center gap-2 text-white/40">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Нейросеть Иваныч: v2.5 Online
                </span>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="flex items-baseline gap-4 lg:text-right">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono">
                  99.8%
                </span>
                <p className="text-xs sm:text-sm text-white/60 max-w-[260px] leading-snug">
                  Точность подбора OEM-артикулов и регламентов ТО по маркам
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Monumental TextReveal Headlines (Cloudmill typography) */}
          <div className="py-12 sm:py-20">
            <TextReveal delay={0.15}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[90px] xl:text-[104px] font-black tracking-[-0.04em] leading-[0.98] text-white uppercase">
                ТЕЛЕМЕТРИЯ АВТОМОБИЛЯ
              </h1>
            </TextReveal>
            <TextReveal delay={0.3}>
              <div className="text-3xl sm:text-5xl md:text-6xl lg:text-[76px] xl:text-[90px] font-black tracking-[-0.04em] leading-[1.02] text-white/50 uppercase mt-2">
                С ЛИЧНЫМ AI-МЕХАНИКОМ{" "}
                <span className="text-white underline decoration-white/30 underline-offset-8">
                  ИВАНЫЧЕМ
                </span>
              </div>
            </TextReveal>
            
            <FadeUp delay={0.4} className="mt-8 flex flex-col sm:flex-row sm:items-center gap-6 max-w-3xl">
              <p className="text-base sm:text-xl text-white/70 leading-relaxed font-light">
                Забудьте о блокнотах и запутанных таблицах. Фиксируйте заправки за 2 секунды текстом в чате, 
                находите проверенные запчасти со ссылками на Автодок и держите регламент под контролем.
              </p>
              <div className="shrink-0">
                <a
                  href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}
                  className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-8 text-xs font-bold uppercase tracking-wider text-black transition-all duration-300 hover:bg-neutral-200 active:scale-95 shadow-2xl"
                >
                  <span>Начать бесплатно</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </FadeUp>
          </div>

          {/* Full-Bleed Showcase Module (HUD Telemetry & Live Interactive Terminal) */}
          <FadeUp delay={0.5} className="w-full relative">
            <div className="w-full rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-10 lg:p-12 shadow-[0_30px_90px_rgba(0,0,0,0.9)] relative overflow-hidden">
              
              {/* Header inside showcase */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/10 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 font-mono text-xs font-bold">
                    00
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/40 font-mono">
                      БОРТОВАЯ ТЕЛЕМЕТРИЯ И ДИАЛОГ
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>KIA Rio III Рестайлинг 1.6 MT</span>
                      <span className="text-xs font-normal text-white/40 font-mono">| Одометр: 159 400 км</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    РЕГЛАМЕНТ АКТИВЕН
                  </span>
                </div>
              </div>

              {/* Cockpit Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
                
                {/* Left: Telemetry Gauges (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                  
                  {/* Oil Gauge */}
                  <div className="rounded-2xl border border-white/5 bg-[#17171A] p-5">
                    <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                      <span className="flex items-center gap-2 font-mono uppercase tracking-wider">
                        <Fuel className="h-4 w-4 text-amber-400" />
                        Моторное масло 5W-30
                      </span>
                      <span className="font-mono text-amber-400 font-bold">Осталось 600 км</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: "94%" }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-white/40 font-mono mt-2">
                      <span>Замена: 150 000 км</span>
                      <span>Регламент: 160 000 км</span>
                    </div>
                  </div>

                  {/* Tires Gauge */}
                  <div className="rounded-2xl border border-white/5 bg-[#17171A] p-5">
                    <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                      <span className="flex items-center gap-2 font-mono uppercase tracking-wider">
                        <Disc className="h-4 w-4 text-emerald-400" />
                        Комплект: Continental PremiumContact 6
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">6.8 мм</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40">ПЛ</div>
                        <div className="font-bold text-white">6.8 мм</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40">ПР</div>
                        <div className="font-bold text-white">6.8 мм</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40">ЗЛ</div>
                        <div className="font-bold text-white">7.2 мм</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-white/40">ЗР</div>
                        <div className="font-bold text-white">7.2 мм</div>
                      </div>
                    </div>
                  </div>

                  {/* Warehouse alert */}
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 flex items-start gap-3">
                    <Boxes className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-white/80 leading-relaxed">
                      <span className="font-bold text-sky-400">Гаражный склад:</span> На стеллаже найден масляный фильтр{" "}
                      <span className="font-mono font-semibold text-white">Mann W81180</span>. Иваныч учтет это при расчете сметы!
                    </div>
                  </div>

                </div>

                {/* Right: Live Interactive Terminal with Ivanych (7 cols) */}
                <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0E0E10] p-5 sm:p-6 shadow-inner">
                  
                  {/* Messages Feed */}
                  <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2">
                    {demoMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.sender === "ivanych" && (
                          <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-white/20 bg-neutral-800">
                            <img
                              src="/avatars/ivanych.webp"
                              alt="Иваныч"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback if image not rendered
                                (e.target as HTMLElement).style.display = "none"
                              }}
                            />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                            msg.sender === "user"
                              ? "bg-white text-black font-medium rounded-tr-sm"
                              : "bg-[#18181B] text-white/90 border border-white/10 rounded-tl-sm space-y-2"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          {msg.link && (
                            <a
                              href={msg.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 underline decoration-sky-400/30"
                            >
                              <span>{msg.linkText || "Открыть на Autodoc.ru"}</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action Pills */}
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <div className="text-[11px] text-white/40 font-mono mb-2">БЫСТРЫЙ ТЕСТ-ДРАЙВ:</div>
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
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
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
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        ⛽ Заправил 42 литра АИ-95
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickAction(
                            "Подскажи артикул свечей зажигания",
                            "Оригинальные свечи Hyundai/Kia 18846-10060 либо японские NGK 1578 (LZKR6B-10E). Комплект из 4 шт. уже ждет на Автодоке.",
                            "https://www.autodoc.ru/price/0/1578",
                            "Свечи NGK 1578 на Autodoc ↗"
                          )
                        }
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        ⚡ Артикул свечей
                      </button>
                    </div>
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleCustomSend} className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                    <input
                      type="text"
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      placeholder="Напишите Иванычу: «Заправился на 2000р» или «Какие колодки взять?»..."
                      className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                    />
                    <button
                      type="submit"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-200 transition-colors shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>

                </div>

              </div>

              {/* Exact Cloudmill Multi-layer Progressive Blur (Bottom fadeout) */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 z-20">
                <div className="absolute inset-0 z-10 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%)]" />
                <div className="absolute inset-0 z-20 backdrop-blur-[6px] [mask-image:linear-gradient(to_bottom,transparent_30%,black_75%)]" />
                <div className="absolute inset-0 z-30 backdrop-blur-[14px] [mask-image:linear-gradient(to_bottom,transparent_75%,black_100%)]" />
              </div>

            </div>
          </FadeUp>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 02 / SECTION 1: [ 1 ] КЕЙСЫ И СВЕРХСПОСОБНОСТИ ИВАНЫЧА      */}
      {/* ============================================================ */}
      <section id="ivanych" className="py-24 sm:py-36 border-t border-white/5">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          {/* Section Indicator Badge (Cloudmill [ 1 ] style) */}
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 font-mono text-lg font-bold text-white">
                1
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-white/50">
                КЕЙСЫ И СВЕРХСПОСОБНОСТИ
              </span>
            </div>
          </FadeUp>

          {/* Heading */}
          <TextReveal delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] text-white uppercase max-w-5xl leading-[1.05]">
              ОРИЕНТИРОВАНЫ НА РЕЗУЛЬТАТ И ДОКАЗЫВАЕМ ЭТО НА ВАШЕМ АВТО
            </h2>
          </TextReveal>

          <FadeUp delay={0.2} className="mt-4 text-base sm:text-xl text-white/60 font-light max-w-3xl">
            25+ лет практического опыта автомеханика оцифрованы в базе знаний. Иваныч не просто ведет учет трат — 
            он бережет ваш автомобиль и кошелек от навязанных сервисных услуг.
          </FadeUp>

          {/* Large Project Showcase Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 sm:mt-20">
            {caseProjects.map((project, idx) => (
              <FadeUp key={idx} delay={0.15 * idx} className="h-full">
                <div className="group h-full flex flex-col justify-between rounded-3xl border border-white/10 bg-[#121214] p-8 sm:p-10 transition-all duration-500 hover:border-white/30 hover:bg-[#151518]">
                  
                  <div>
                    {/* Top Row: Number & Tag */}
                    <div className="flex items-center justify-between pb-6 border-b border-white/10">
                      <span className="font-mono text-2xl font-black text-white/30 group-hover:text-white transition-colors">
                        {project.num}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono text-white/70">
                        {project.tag}
                      </span>
                    </div>

                    {/* Car Model & Headline */}
                    <div className="mt-6">
                      <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                        {project.car}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-2 leading-snug">
                        {project.headline}
                      </h3>
                    </div>

                    {/* Badges List */}
                    <div className="flex flex-wrap gap-2 mt-6">
                      {project.badges.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/80"
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    {/* Dialog Sample */}
                    <div className="mt-8 rounded-2xl border border-white/5 bg-[#0B0B0B]/80 p-5 space-y-3">
                      <div className="text-xs text-white/50">
                        <span className="font-bold text-white">Владелец:</span> «{project.dialog.user}»
                      </div>
                      <div className="text-xs text-white/80 leading-relaxed border-t border-white/5 pt-3">
                        <span className="font-bold text-amber-400">Иваныч:</span> {project.dialog.assistant}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Metrics & Action */}
                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-white/40">ЭКОНОМИЯ НА ТО</div>
                      <div className="text-2xl font-black font-mono text-emerald-400">{project.savings}</div>
                    </div>
                    <a
                      href={project.partLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:bg-white group-hover:text-black"
                      aria-label="Direct Link"
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
      <section id="expertise" className="py-24 sm:py-36 border-t border-white/5 overflow-hidden">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 font-mono text-lg font-bold text-white">
                2
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-white/50">
                ЭКСПЕРТИЗА И ТЕХНОЛОГИИ
              </span>
            </div>
          </FadeUp>

          <TextReveal delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] text-white uppercase max-w-5xl leading-[1.05]">
              БАЗА ДАННЫХ ПО РЕГЛАМЕНТАМ И ДОПУСКАМ ВЕДУЩИХ АВТОКОНЦЕРНОВ
            </h2>
          </TextReveal>

          {/* Metric Counters Grid (Cloudmill style) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 sm:mt-20">
            <FadeUp delay={0.1}>
              <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8">
                <div className="text-4xl sm:text-6xl font-black font-mono text-white">24/7</div>
                <div className="text-xs sm:text-sm text-white/60 mt-3">
                  Иваныч на связи без очередей, выходных и перерывов
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8">
                <div className="text-4xl sm:text-6xl font-black font-mono text-white">2 сек</div>
                <div className="text-xs sm:text-sm text-white/60 mt-3">
                  На фиксацию заправки или сервиса одной строкой в чате
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8">
                <div className="text-4xl sm:text-6xl font-black font-mono text-emerald-400">0 ₽</div>
                <div className="text-xs sm:text-sm text-white/60 mt-3">
                  Переплат за ненужные навязанные работы в автосервисах
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 sm:p-8">
                <div className="text-4xl sm:text-6xl font-black font-mono text-white">100%</div>
                <div className="text-xs sm:text-sm text-white/60 mt-3">
                  Конфиденциальность чеков и привязка к вашему гаражу
                </div>
              </div>
            </FadeUp>
          </div>

        </div>

        {/* Cloudmill Infinite Marquee Ticker */}
        <div className="mt-20 sm:mt-28 space-y-4">
          
          {/* Ticker Line 1: Auto Brands */}
          <div className="relative w-full overflow-hidden whitespace-nowrap py-3 border-y border-white/10">
            <div className="flex animate-marquee gap-8 text-xl sm:text-2xl font-black tracking-widest text-white/40 uppercase font-mono">
              {[...brandTickerRow1, ...brandTickerRow1].map((brand, i) => (
                <span key={i} className="flex items-center gap-8">
                  <span>{brand}</span>
                  <span className="text-white/20">•</span>
                </span>
              ))}
            </div>
          </div>

          {/* Ticker Line 2: Systems & Features */}
          <div className="relative w-full overflow-hidden whitespace-nowrap py-3 border-b border-white/10">
            <div
              className="flex gap-8 text-xl sm:text-2xl font-black tracking-widest text-white/30 uppercase font-mono"
              style={{ animation: "marquee 32s linear infinite reverse" }}
            >
              {[...brandTickerRow2, ...brandTickerRow2].map((feat, i) => (
                <span key={i} className="flex items-center gap-8">
                  <span className="text-white/80">{feat}</span>
                  <span className="text-white/20">—</span>
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 04 / SECTION 3: [ 3 ] ВОЗМОЖНОСТИ ЭКОСИСТЕМЫ                 */}
      {/* ============================================================ */}
      <section id="features" className="py-24 sm:py-36 border-t border-white/5">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 font-mono text-lg font-bold text-white">
                3
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-white/50">
                ВОЗМОЖНОСТИ ПЛАТФОРМЫ
              </span>
            </div>
          </FadeUp>

          <TextReveal delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] text-white uppercase max-w-5xl leading-[1.05]">
              ЭКОСИСТЕМА ДЛЯ ТЕХ, КТО ЛЮБИТ И ЦЕНИТ СВОЙ АВТОМОБИЛЬ
            </h2>
          </TextReveal>

          {/* Cloudmill Interactive Accordion List */}
          <div className="mt-16 sm:mt-24 border-t border-white/10">
            {platformFeatures.map((feat) => {
              const isOpen = openFeatureIdx === feat.idx
              return (
                <div
                  key={feat.idx}
                  className="border-b border-white/10 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFeatureIdx(isOpen ? "" : feat.idx)}
                    className="w-full py-8 sm:py-10 flex flex-col md:flex-row md:items-center justify-between text-left group"
                  >
                    <div className="flex items-baseline gap-6 sm:gap-10">
                      <span className="font-mono text-lg sm:text-2xl font-bold text-white/30 group-hover:text-white transition-colors">
                        {feat.idx}
                      </span>
                      <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white group-hover:text-white/80 transition-colors">
                        {feat.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 mt-4 md:mt-0 pl-12 md:pl-0">
                      <span className="hidden lg:inline-block text-xs font-mono text-white/40">
                        {feat.short}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-transform duration-300 group-hover:rotate-45">
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
                          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-light">
                            {feat.description}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {feat.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-white/80"
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
      <section id="battle" className="py-24 sm:py-36 border-t border-white/5">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          <FadeUp>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 font-mono text-lg font-bold text-white">
                4
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-white/50">
                ЧЕСТНЫЙ БАТТЛ
              </span>
            </div>
          </FadeUp>

          <TextReveal delay={0.1}>
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] text-white uppercase max-w-5xl leading-[1.05]">
              ПОЧЕМУ AUTONOTES С ИВАНЫЧЕМ ПОБЕЖДАЕТ БЛОКНОТ И EXCEL
            </h2>
          </TextReveal>

          {/* 3-Column Split Comparison (Cloudmill style) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 sm:mt-24">
            
            {/* Card 1: Paper Notebook */}
            <FadeUp delay={0.1}>
              <div className="h-full rounded-3xl border border-white/5 bg-[#121214]/40 p-8 flex flex-col justify-between opacity-60 hover:opacity-100 transition-opacity">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <span className="text-xs uppercase font-mono text-white/40">СТАРЫЙ МЕТОД</span>
                    <span className="text-xs font-mono text-rose-400">01 / БЛОКНОТ</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-6">Бумажная тетрадь в бардачке</h3>
                  <div className="mt-8 space-y-6">
                    {battleComparison.map((row, i) => (
                      <div key={i} className="text-xs sm:text-sm space-y-1">
                        <div className="text-white/40 font-mono text-[11px]">{row.metric}:</div>
                        <div className="text-white/70 flex items-start gap-2">
                          <X className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{row.notebook}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 text-xs text-white/40 font-mono">
                  Итог: чеки теряются, одометр забывается
                </div>
              </div>
            </FadeUp>

            {/* Card 2: Excel Spreadsheet */}
            <FadeUp delay={0.2}>
              <div className="h-full rounded-3xl border border-white/5 bg-[#121214]/60 p-8 flex flex-col justify-between opacity-75 hover:opacity-100 transition-opacity">
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <span className="text-xs uppercase font-mono text-white/40">СЛОЖНЫЙ МЕТОД</span>
                    <span className="text-xs font-mono text-amber-400">02 / EXCEL</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-6">Таблицы со смартфона</h3>
                  <div className="mt-8 space-y-6">
                    {battleComparison.map((row, i) => (
                      <div key={i} className="text-xs sm:text-sm space-y-1">
                        <div className="text-white/40 font-mono text-[11px]">{row.metric}:</div>
                        <div className="text-white/70 flex items-start gap-2">
                          <X className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{row.excel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 text-xs text-white/40 font-mono">
                  Итог: 80% водителей бросают вести через 2 месяца
                </div>
              </div>
            </FadeUp>

            {/* Card 3: AutoNotes Dominator */}
            <FadeUp delay={0.3}>
              <div className="h-full rounded-3xl border-2 border-white/20 bg-[#161618] p-8 flex flex-col justify-between shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-white/10">
                    <span className="text-xs uppercase font-mono text-emerald-400 font-bold">ЦИФРОВОЙ СТАНДАРТ</span>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-mono text-emerald-400">
                      03 / AUTONOTES
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-6 flex items-center gap-2">
                    <span>AutoNotes & Иваныч</span>
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </h3>
                  <div className="mt-8 space-y-6">
                    {battleComparison.map((row, i) => (
                      <div key={i} className="text-xs sm:text-sm space-y-1">
                        <div className="text-white/40 font-mono text-[11px]">{row.metric}:</div>
                        <div className="text-white font-medium flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{row.autonote}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <a
                    href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-xs font-extrabold uppercase tracking-wider text-black transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <span>Выбрать AutoNotes</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

              </div>
            </FadeUp>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 06 / MONUMENTAL CTA BANNER & FOOTER (CLOUDMILL REPLICA)      */}
      {/* ============================================================ */}
      <footer id="contacts" className="pt-20 pb-16 border-t border-white/10 relative overflow-hidden">
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
          
          {/* Monumental Cloudmill CTA Block */}
          <div className="rounded-3xl border border-white/10 bg-[#121214] p-8 sm:p-14 lg:p-20 relative overflow-hidden">
            <div className="relative z-10 max-w-4xl">
              <TextReveal>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-4">
                  [ 05 / СТАРТ РАБОТЫ ]
                </div>
              </TextReveal>
              <TextReveal delay={0.1}>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-white uppercase leading-[1.02]">
                  ГОТОВЫ ПЕРЕВЕСТИ СВОЙ АВТОМОБИЛЬ В ЦИФРУ?
                </h2>
              </TextReveal>
              <FadeUp delay={0.2} className="mt-6 text-base sm:text-xl text-white/60 font-light max-w-2xl">
                Запустите гараж за 30 секунд. Иваныч сразу считает ваш регламент по марке и пробегу, 
                подберет запчасти и сохранит историю навсегда.
              </FadeUp>

              <FadeUp delay={0.3} className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href={isAuthed ? appUrl("/dashboard") : appUrl("/register")}
                  className="group flex h-16 items-center gap-4 rounded-full bg-white px-9 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 active:scale-95 shadow-2xl"
                >
                  <span>{isAuthed ? "Перейти в гараж" : "Запустить гараж с Иванычем"}</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:rotate-45">
                    <Plus className="h-4 w-4" />
                  </div>
                </a>
                <a
                  href="https://t.me/AutoNotesBot"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-16 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
                >
                  <span>Телеграм-бот</span>
                  <ExternalLink className="h-4 w-4 text-white/50" />
                </a>
              </FadeUp>
            </div>

            {/* Watermark in CTA */}
            <div className="pointer-events-none absolute -bottom-10 -right-10 select-none opacity-[0.03]">
              <span className="text-[20vw] font-black tracking-tighter text-white">AN</span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-20 pt-16 border-t border-white/10 text-xs sm:text-sm">
            
            {/* Col 1: Brand & Desc */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 font-bold tracking-tight text-white text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/10 font-mono text-xs">
                  AN
                </span>
                <span>AutoNotes</span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed max-w-[240px]">
                Премиальная цифровая платформа учета расходов и телеметрии авто с персональным AI-механиком Иванычем.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-3">
              <div className="font-mono text-xs uppercase tracking-wider text-white/40">НАВИГАЦИЯ</div>
              <ul className="space-y-2 text-white/70">
                <li>
                  <a href="#ivanych" className="hover:text-white transition-colors">
                    01 / Кейсы и Иваныч
                  </a>
                </li>
                <li>
                  <a href="#expertise" className="hover:text-white transition-colors">
                    02 / Экспертиза и Бренды
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    03 / Возможности
                  </a>
                </li>
                <li>
                  <a href="#battle" className="hover:text-white transition-colors">
                    04 / Честный Баттл
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Contacts */}
            <div className="space-y-3">
              <div className="font-mono text-xs uppercase tracking-wider text-white/40">СВЯЗЬ И ЗАБОТА</div>
              <ul className="space-y-2 text-white/70">
                <li>
                  <a href="mailto:info@auto-notes.ru" className="hover:text-white transition-colors">
                    info@auto-notes.ru
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/AutoNotesBot"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Telegram: @AutoNotesBot
                  </a>
                </li>
                <li>
                  <span className="text-white/40 text-xs">Поддержка автолюбителей 24/7</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Top button & Copyright */}
            <div className="flex flex-col justify-between items-start md:items-end">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-mono text-white/70 hover:border-white/30 hover:text-white transition-all"
              >
                <span>Наверх</span>
                <ArrowRight className="h-3.5 w-3.5 -rotate-90 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <div className="text-[11px] text-white/40 font-mono mt-8 md:mt-0">
                &copy; {new Date().getFullYear()} AutoNotes. Все права защищены.
              </div>
            </div>

          </div>

        </div>
      </footer>

    </div>
  )
}
