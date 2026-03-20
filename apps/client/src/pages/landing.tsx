import { useRef } from "react"
import { Navigate } from "react-router-dom"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import {
  Car,
  Fuel,
  BarChart3,
  Shield,
  FileSpreadsheet,
  Moon,
  Wallet,
  Handshake,
  TrendingUp,
  Clock,
  Wrench,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Gauge,
  CalendarCheck,
  PiggyBank,
  ListChecks,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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


const features = [
  {
    icon: Fuel,
    title: "Учёт топлива",
    description:
      "Записывайте каждую заправку с указанием объёма, стоимости и пробега. Рассчитывайте средний расход на 100 км автоматически.",
  },
  {
    icon: Wrench,
    title: "Ремонт и ТО",
    description:
      "Фиксируйте все работы по обслуживанию: от замены масла до капитального ремонта. Не пропустите ни одного ТО.",
  },
  {
    icon: BarChart3,
    title: "Наглядная аналитика",
    description:
      "Интерактивные графики расходов по категориям и месяцам. Видите, куда уходят деньги, и оптимизируйте бюджет.",
  },
  {
    icon: Car,
    title: "Несколько автомобилей",
    description:
      "Ведите учёт для всего автопарка — от семейного седана до рабочего фургона. Сравнивайте расходы между авто.",
  },
  {
    icon: Shield,
    title: "Безопасность данных",
    description:
      "Надёжная JWT-авторизация. Ваши данные принадлежат только вам — никакой рекламы и продажи информации.",
  },
  {
    icon: FileSpreadsheet,
    title: "Экспорт в CSV",
    description:
      "Выгружайте историю расходов для анализа в Excel или Google Sheets. Полный контроль над вашими данными.",
  },
  {
    icon: Moon,
    title: "Тёмная тема",
    description:
      "Светлая, тёмная или системная тема оформления — работайте в комфортном режиме в любое время суток.",
  },
  {
    icon: Gauge,
    title: "Быстрый доступ",
    description:
      "Минимальный интерфейс без лишних элементов. Добавление расхода занимает всего несколько секунд.",
  },
]

const benefits = [
  {
    icon: PiggyBank,
    title: "Планирование бюджета",
    description:
      "Зная точные расходы за прошлые месяцы, вы можете спрогнозировать будущие траты и заложить их в семейный бюджет. Никаких неприятных сюрпризов — вы всегда знаете, сколько стоит содержание автомобиля.",
    color: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: Handshake,
    title: "Прозрачность при продаже",
    description:
      "Полная история обслуживания — лучший аргумент при продаже автомобиля. Покупатель видит, что машина содержалась в порядке: регулярные ТО, качественные запчасти, своевременный ремонт. Это повышает доверие и стоимость авто.",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: TrendingUp,
    title: "Оптимизация затрат",
    description:
      "Анализируя данные, вы находите неочевидные возможности для экономии: выбираете выгодные АЗС, замечаете повышенный расход топлива вовремя, планируете замену расходников до поломки. Экономия до 15-20% на содержании авто.",
    color: "from-amber-500/20 to-amber-500/5",
  },
  {
    icon: CalendarCheck,
    title: "Контроль обслуживания",
    description:
      "Не забывайте о плановом ТО, замене масла, фильтров и ремня ГРМ. История всех работ перед глазами — вы точно знаете, когда и что было сделано, и когда наступит срок следующего обслуживания.",
    color: "from-violet-500/20 to-violet-500/5",
  },
  {
    icon: ListChecks,
    title: "Учёт запасных частей",
    description:
      "Ведите реестр купленных запчастей с указанием бренда, артикула и стоимости. Знайте, какие детали установлены на автомобиль и когда их нужно заменить. Больше не нужно вспоминать — всё записано.",
    color: "from-rose-500/20 to-rose-500/5",
  },
  {
    icon: Clock,
    title: "История владения",
    description:
      "Создайте полную цифровую летопись вашего автомобиля. Каждый рубль, каждое ТО, каждая деталь — всё сохраняется и доступно в любой момент. Через годы вы сможете точно сказать, во сколько обошлось владение авто.",
    color: "from-cyan-500/20 to-cyan-500/5",
  },
]

const steps = [
  {
    step: "01",
    title: "Зарегистрируйтесь",
    description: "Создайте аккаунт за 30 секунд и сразу начните вести учёт.",
  },
  {
    step: "02",
    title: "Добавьте автомобиль",
    description: "Укажите марку, модель и год выпуска. Загрузите фото — и ваш гараж готов.",
  },
  {
    step: "03",
    title: "Записывайте расходы",
    description: "Фиксируйте каждую трату: заправка, мойка, ремонт, страховка, штрафы и всё остальное.",
  },
  {
    step: "04",
    title: "Анализируйте",
    description: "Изучайте графики, сравнивайте периоды, находите возможности для экономии.",
  },
]

const stats = [
  { value: 100, suffix: "%", label: "Ваши данные" },
  { value: 15, suffix: "+", label: "Категорий расходов" },
  { value: 5, suffix: "с", label: "На добавление записи" },
  { value: 24, suffix: "/7", label: "Доступ к данным" },
]

export function LandingPage() {
  const isAuthed = useAuthStore((s) => !!s.accessToken)

  // On app domain, if authenticated, redirect straight to dashboard
  if (isAuthed && isAppDomain()) {
    return <Navigate to="/dashboard" replace />
  }

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="h-4 w-4" />
            </div>
            AutoNotes
          </a>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-6 sm:flex">
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Возможности
              </a>
              <a href="#benefits" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Преимущества
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Как начать
              </a>
            </nav>
            <div className="flex items-center gap-2">
              {isAuthed ? (
                <Button size="sm" asChild>
                  <a href={appUrl("/dashboard")}>
                    В гараж
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </a>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={appUrl("/login")}>Войти</a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href={appUrl("/register")}>
                      Начать
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-cyan-500/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-emerald-500/15 to-blue-500/15 blur-3xl"
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 text-center sm:pb-28 sm:pt-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block h-2 w-2 rounded-full bg-emerald-500"
            />
            Удобный учёт без ограничений
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Полный контроль над{" "}
            <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
              расходами
            </span>{" "}
            на автомобиль
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Записывайте каждую трату — от заправки до капремонта. Анализируйте статистику,
            планируйте бюджет и сохраняйте полную историю обслуживания вашего автомобиля.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            {isAuthed ? (
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <a href={appUrl("/dashboard")}>
                  В гараж
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <a href={appUrl("/register")}>
                  Создать аккаунт
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            )}
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
              <a href="#benefits">Узнать больше</a>
            </Button>
          </motion.div>

          {/* Floating cards decoration */}
          <div className="relative mx-auto mt-16 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="relative rounded-2xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-black/5 backdrop-blur-sm"
            >
              {/* Mock dashboard */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500" />
                    <div>
                      <div className="text-sm font-medium">Toyota Camry 2023</div>
                      <div className="text-xs text-muted-foreground">56 340 км пробега</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">₽ 12 450</div>
                    <div className="text-xs text-muted-foreground">в этом месяце</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Топливо", amount: "₽ 6 200", pct: "50%" },
                    { label: "ТО", amount: "₽ 3 500", pct: "28%" },
                    { label: "Мойка", amount: "₽ 1 800", pct: "14%" },
                    { label: "Прочее", amount: "₽ 950", pct: "8%" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      whileHover={{ scale: 1.05 }}
                      className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center"
                    >
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="mt-1 text-sm font-semibold">{item.amount}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{item.pct}</div>
                    </motion.div>
                  ))}
                </div>
                {/* Chart bars */}
                <div className="flex items-end gap-1.5 h-20 pt-2">
                  {[35, 45, 55, 40, 65, 50, 70, 45, 80, 60, 75, 85].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: 1.2 + i * 0.05, ease: "easeOut" }}
                      className="flex-1 rounded-t bg-gradient-to-t from-blue-500/60 to-violet-500/60"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating notifications */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              whileHover={{ scale: 1.05 }}
              className="absolute -left-4 top-8 hidden rounded-xl border border-border/60 bg-card p-3 shadow-lg backdrop-blur-sm sm:block"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                  <Fuel className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs font-medium">Заправка</div>
                  <div className="text-xs text-muted-foreground">₽ 3 200</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              whileHover={{ scale: 1.05 }}
              className="absolute -right-4 bottom-16 hidden rounded-xl border border-border/60 bg-card p-3 shadow-lg backdrop-blur-sm sm:block"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                  <Wrench className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-medium">Замена масла</div>
                  <div className="text-xs text-muted-foreground">₽ 4 500</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <StaggerChildren className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <StaggerItem key={stat.label} className="text-center">
                <div className="text-3xl font-bold sm:text-4xl">
                  {stat.value}
                  {stat.suffix}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Всё необходимое для учёта
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Простой и мощный инструмент, который поможет держать расходы на автомобиль под контролем
            </p>
          </FadeIn>

          <StaggerChildren className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group h-full rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-border hover:bg-accent/30"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Зачем вести учёт расходов на авто?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Большинство автовладельцев не знают, сколько на самом деле стоит их машина.
              AutoNotes помогает увидеть полную картину.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => (
              <FadeIn key={benefit.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-8"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${benefit.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold">{benefit.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Начните за 2 минуты
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Никаких сложных настроек — зарегистрируйтесь и начните записывать расходы прямо сейчас
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.15}>
                <div className="relative text-center">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-1/2 top-8 hidden h-px w-full bg-gradient-to-r from-border to-transparent lg:block" />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-2xl font-bold text-primary"
                  >
                    {step.step}
                  </motion.div>
                  <h3 className="mb-2 font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed benefits section */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Экономьте с умом
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Автовладельцы, ведущие учёт расходов, экономят в среднем 15-20% на содержании автомобиля
            </p>
          </FadeIn>

          <div className="mt-14 space-y-20">
            {/* Row 1 */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <FadeIn direction="right">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <Wallet className="h-3.5 w-3.5" />
                    Финансы
                  </div>
                  <h3 className="mb-4 text-2xl font-bold">
                    Знайте реальную стоимость владения
                  </h3>
                  <p className="mb-6 text-muted-foreground leading-relaxed">
                    Средний россиянин тратит на автомобиль от 50 000 до 150 000 рублей в месяц, но большинство
                    даже не подозревает об этом. Мелкие расходы — мойка, парковка, штрафы — незаметно
                    складываются в значительные суммы. AutoNotes покажет полную картину ваших расходов.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Точный подсчёт стоимости километра пробега",
                      "Сравнение расходов по периодам",
                      "Выявление категорий с наибольшими тратами",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
              <FadeIn direction="left" delay={0.2}>
                <div className="rounded-2xl border border-border/60 bg-card p-6">
                  <div className="mb-4 text-sm font-medium">Расходы за 2025 год</div>
                  <div className="space-y-3">
                    {[
                      { cat: "Топливо", amount: "78 400 ₽", pct: 42, color: "bg-blue-500" },
                      { cat: "ТО и ремонт", amount: "45 200 ₽", pct: 24, color: "bg-violet-500" },
                      { cat: "Страховка", amount: "32 000 ₽", pct: 17, color: "bg-amber-500" },
                      { cat: "Мойка", amount: "15 600 ₽", pct: 8, color: "bg-emerald-500" },
                      { cat: "Прочее", amount: "16 800 ₽", pct: 9, color: "bg-rose-500" },
                    ].map((item) => (
                      <div key={item.cat}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{item.cat}</span>
                          <span className="font-medium">{item.amount}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                    <span>Итого</span>
                    <span>188 000 ₽</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Row 2 */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <FadeIn direction="right" className="order-2 lg:order-1">
                <div className="rounded-2xl border border-border/60 bg-card p-6">
                  <div className="mb-4 text-sm font-medium">История обслуживания</div>
                  <div className="space-y-4">
                    {[
                      { date: "15.03.2026", work: "Замена масла + фильтр", km: "56 340 км", cost: "4 500 ₽" },
                      { date: "02.02.2026", work: "Замена тормозных колодок", km: "54 120 км", cost: "8 200 ₽" },
                      { date: "18.12.2025", work: "ТО-3 (регламент)", km: "51 000 км", cost: "12 400 ₽" },
                      { date: "05.10.2025", work: "Шиномонтаж (зимние)", km: "48 500 км", cost: "3 600 ₽" },
                      { date: "20.08.2025", work: "Замена масла + фильтр", km: "45 200 км", cost: "4 300 ₽" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between rounded-lg border border-border/40 p-3 text-sm"
                      >
                        <div>
                          <div className="font-medium">{item.work}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.date} &middot; {item.km}
                          </div>
                        </div>
                        <div className="font-medium">{item.cost}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FadeIn>
              <FadeIn direction="left" delay={0.2} className="order-1 lg:order-2">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <Handshake className="h-3.5 w-3.5" />
                    При продаже
                  </div>
                  <h3 className="mb-4 text-2xl font-bold">
                    Продавайте дороже с полной историей
                  </h3>
                  <p className="mb-6 text-muted-foreground leading-relaxed">
                    Покупатель готов заплатить на 10-15% больше за автомобиль с подтверждённой историей
                    обслуживания. Покажите, что ваша машина содержалась правильно: регулярные ТО, оригинальные
                    запчасти, своевременная замена расходников. AutoNotes — ваш цифровой сервисный журнал.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Полная история всех работ и замен",
                      "Подтверждённые суммы расходов",
                      "Экспорт отчёта для покупателя",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
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

      {/* CTA */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/20 via-violet-500/15 to-cyan-500/20 blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Начните контролировать расходы{" "}
              <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                уже сегодня
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Регистрация занимает 30 секунд.
              Просто удобный инструмент для вашего автомобиля.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {isAuthed ? (
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <a href={appUrl("/dashboard")}>
                    В гараж
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <a href={appUrl("/register")}>
                    Создать аккаунт
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            {!isAuthed && (
              <p className="mt-4 text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <a href={appUrl("/login")} className="text-primary underline-offset-4 hover:underline">
                  Войти
                </a>
              </p>
            )}
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Car className="h-4 w-4" />
              </div>
              AutoNotes
            </div>
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <a href="#features" className="transition-colors hover:text-foreground">
                Возможности
              </a>
              <a href="#benefits" className="transition-colors hover:text-foreground">
                Преимущества
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-foreground">
                Как начать
              </a>
            </nav>
          </div>
          <div className="mt-8 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AutoNotes. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}
