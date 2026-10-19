import { useMemo, useState, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { vehiclesApi } from "@/api/vehicles"
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses"
import { useDeleteVehicle } from "@/hooks/use-vehicles"
import { useVehicleStats } from "@/hooks/use-stats"
import { useServiceIntervals } from "@/hooks/use-service-intervals"
import { useAuthStore } from "@/lib/auth-store"
import { ExpenseDialog } from "@/components/expense-dialog"
import { ExpenseDetailDialog } from "@/components/expense-detail-dialog"
import { ImportDialog } from "@/components/import-dialog"
import { EditVehicleDialog } from "@/components/edit-vehicle-dialog"
import { ShareReportDialog } from "@/components/share-report-dialog"
import { PartsInventory } from "@/components/parts-inventory"
import { ServiceIntervals } from "@/components/service-intervals"
import { TiresManager } from "@/components/tires-manager"
import { VehicleAlerts } from "@/components/vehicle-alerts"
import { IvanychWidget } from "@/components/ivanych-widget"
import { PdfReportDialog } from "@/components/pdf-report-dialog"
import { CategoryPieChart } from "@/components/charts/category-pie-chart"
import { MonthlyLineChart } from "@/components/charts/monthly-line-chart"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Gauge,
  Trash2,
  Calendar,
  Car,
  ChevronDown,
  ChevronRight,
  Download,
  Fuel,
  Pencil,
  Receipt,
  Search,
  ArrowUpDown,
  BarChart3,
  Wrench,
  Camera,
  Paperclip,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Info,
  Package,
  Plus,
  Printer,
} from "lucide-react"

function formatAmount(amount: number) {
  return amount.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatMonthHeader(key: string) {
  const [y, m] = key.split("-")
  const d = new Date(Number(y), Number(m) - 1)
  return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
}

type SortField = "date" | "amount"
type SortDir = "asc" | "desc"

export function VehiclePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [catFilter, setCatFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [expensesOpen, setExpensesOpen] = useState(false)
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set())
  const [metaOpen, setMetaOpen] = useState(false)
  const [chartsOpen, setChartsOpen] = useState(false)
  const token = useAuthStore((s) => s.accessToken)

  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehiclesApi.getOne(id!),
    enabled: !!id,
  })

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(id)
  const { data: serviceIntervals = [] } = useServiceIntervals(id)
  const { data: stats } = useVehicleStats(id!)
  const deleteVehicle = useDeleteVehicle()
  const deleteExpense = useDeleteExpense()
  const qc = useQueryClient()
  const photoRef = useRef<HTMLInputElement>(null)

  const isLoading = vehicleLoading || expensesLoading

  const categories = useMemo(() => {
    const map = new Map<string, { slug: string; name: string }>()
    expenses.forEach((e) => map.set(e.category.slug, e.category))
    return Array.from(map.values())
  }, [expenses])

  const filtered = useMemo(() => {
    let list = expenses

    if (catFilter !== "all") {
      list = list.filter((e) => e.category.slug === catFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.category.name.toLowerCase().includes(q),
      )
    }

    list = [...list].sort((a, b) => {
      if (sortField === "amount") {
        return sortDir === "desc" ? b.amount - a.amount : a.amount - b.amount
      }
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      return sortDir === "desc" ? db - da : da - db
    })

    return list
  }, [expenses, catFilter, search, sortField, sortDir])

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups: { key: string; expenses: typeof filtered; total: number }[] = []
    const map = new Map<string, typeof filtered>()
    for (const e of filtered) {
      const key = e.date.slice(0, 7)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    for (const [key, exps] of map) {
      groups.push({ key, expenses: exps, total: exps.reduce((s, e) => s + e.amount, 0) })
    }
    return groups
  }, [filtered])

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0)

  const toggleMonth = (key: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleDeleteVehicle = () => {
    if (!confirm("Удалить автомобиль и все его расходы?")) return
    deleteVehicle.mutate(id!, { onSuccess: () => navigate("/dashboard") })
  }

  const handleExportCsv = () => {
    const url = `/api/expenses/export/csv?vehicleId=${id}`
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const u = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = u
        a.download = "expenses.csv"
        a.click()
        URL.revokeObjectURL(u)
      })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Автомобиль не найден
      </div>
    )
  }

  const hasMeta = vehicle.vin || vehicle.licensePlate || vehicle.registrationNumber || vehicle.purchaseDate || vehicle.purchasePrice || vehicle.notes

  // Period comparison
  const monthChange = stats && stats.prevMonthTotal > 0
    ? Math.round(((stats.currentMonthTotal - stats.prevMonthTotal) / stats.prevMonthTotal) * 100)
    : null

  return (
    <div className="space-y-8 pb-20 sm:pb-12">
      {/* 01 / Navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>В ГАРАЖ</span>
        </Link>
        <div className="flex items-center gap-2">
          <ShareReportDialog vehicleId={vehicle.id} />
          <EditVehicleDialog vehicle={vehicle} />
          <Button
            variant="outline"
            size="icon"
            onClick={handleDeleteVehicle}
            className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-200 text-slate-400 transition-colors"
            title="Удалить автомобиль"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 02 / Hero Showcase Card */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Car Image with uncropped ambient presentation */}
          <div
            className="relative group w-36 h-36 sm:w-48 sm:h-44 md:w-56 md:h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
            onClick={() => photoRef.current?.click()}
            title="Нажмите, чтобы изменить фото автомобиля"
          >
            {vehicle.photo ? (
              <>
                <img
                  src={`/api${vehicle.photo}`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover blur-xl opacity-30 scale-125 pointer-events-none"
                />
                <img
                  src={`/api${vehicle.photo}`}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="relative z-10 max-h-full max-w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              </>
            ) : (
              <Car className="h-14 w-14 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-600" />
            )}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono font-medium gap-1.5 backdrop-blur-[2px]">
              <Camera className="h-5 w-5" />
              <span>Сменить фото</span>
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && id) {
                  vehiclesApi.uploadPhoto(id, file).then(() => {
                    qc.invalidateQueries({ queryKey: ["vehicles", id] })
                  })
                }
                e.target.value = ""
              }}
            />
          </div>

          {/* Vehicle Info & Telemetry */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                [ БОРТОВОЙ ЖУРНАЛ #{vehicle.id.slice(0, 6).toUpperCase()} ]
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                РЕГЛАМЕНТ АКТИВЕН
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
              {vehicle.brand} {vehicle.model}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {vehicle.year} г.в.
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                {vehicle.mileage.toLocaleString("ru-RU")} км
              </span>
              {vehicle.licensePlate && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-950 border-2 border-slate-900 dark:border-slate-300 font-mono text-xs font-black tracking-widest text-slate-950 dark:text-white shadow-2xs">
                  <span>{vehicle.licensePlate.toUpperCase()}</span>
                  <span className="text-[9px] font-normal border-l border-slate-400 dark:border-slate-600 pl-1.5 text-slate-500">RUS</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick CTA Button */}
          <div className="shrink-0 self-start md:self-center">
            <ExpenseDialog
              vehicleId={vehicle.id}
              trigger={
                <Button className="rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 h-auto shadow-sm transition-all flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить расход
                </Button>
              }
            />
          </div>
        </div>

        {/* Technical Passport / Metadata Drawer */}
        {hasMeta && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
              onClick={() => setMetaOpen(!metaOpen)}
            >
              <Info className="h-3.5 w-3.5 text-slate-400" />
              <span>ТЕХНИЧЕСКИЙ ПАСПОРТ И ДАННЫЕ АВТОМОБИЛЯ</span>
              {metaOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
            {metaOpen && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {vehicle.vin && (
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">VIN КОД</span>
                    <p className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 select-all">{vehicle.vin}</p>
                  </div>
                )}
                {vehicle.registrationNumber && (
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">СТС / ПТС</span>
                    <p className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 select-all">{vehicle.registrationNumber}</p>
                  </div>
                )}
                {vehicle.purchaseDate && (
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">ДАТА ПОКУПКИ</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{formatDate(vehicle.purchaseDate)}</p>
                  </div>
                )}
                {vehicle.purchasePrice && (
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">ЦЕНА ПОКУПКИ</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{formatAmount(vehicle.purchasePrice)}</p>
                  </div>
                )}
                {vehicle.notes && (
                  <div className="col-span-2 sm:col-span-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">ЗАМЕТКИ И ОСОБЕННОСТИ</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">{vehicle.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 03 / Maintenance & Insurance Alerts */}
      <VehicleAlerts
        vehicleId={vehicle.id}
        currentMileage={vehicle.mileage}
        expenses={expenses}
        serviceIntervals={serviceIntervals}
      />

      {/* 04 / Summary Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Spent */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            <span>[ ВСЕГО ПОТРАЧЕНО ]</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {formatAmount(stats?.total ?? 0)}
            </div>
            {stats && stats.stockValue > 0 && (
              <div className="mt-2 space-y-1 text-xs font-mono text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div className="flex justify-between">
                  <span>Расходы:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatAmount(stats.expensesTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Package className="h-3 w-3 text-amber-500" />Склад:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatAmount(stats.stockValue)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* This Month */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            <span>[ В ЭТОМ МЕСЯЦЕ ]</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              {formatAmount(stats?.currentMonthTotal ?? 0)}
            </div>
            {monthChange !== null && (
              <div className={`flex items-center gap-1 text-xs font-mono mt-2 ${monthChange > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {monthChange > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                <span className="font-semibold">{Math.abs(monthChange)}% к пред. месяцу</span>
              </div>
            )}
          </div>
        </div>

        {/* Fuel per 100km */}
        {stats?.avgFuelCostPer100km != null && (
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              <span>[ ТОПЛИВО / 100 КМ ]</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <Fuel className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {formatAmount(stats.avgFuelCostPer100km)}
              </div>
              {stats.avgLitersPer100km != null && (
                <div className="text-xs font-mono text-slate-500 mt-2 flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-amber-500" />
                  <span>{stats.avgLitersPer100km} л на 100 км</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cost per km */}
        {stats?.costPerKm != null && (
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              <span>[ СТОИМОСТЬ КМ ]</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600">
                <Gauge className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {stats.costPerKm.toFixed(1)} ₽
              </div>
              <div className="text-xs font-mono text-slate-400 mt-2">
                С учетом всех затрат
              </div>
            </div>
          </div>
        )}

        {/* Yearly forecast */}
        {stats?.yearlyForecast != null && stats.yearlyForecast > 0 && (
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              <span>[ ПРОГНОЗ / ГОД ]</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {formatAmount(stats.yearlyForecast)}
              </div>
              <div className="text-xs font-mono text-slate-500 mt-2">
                ~{formatAmount(stats.monthlyAvg)} / мес.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 05 / Analytics Section */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
          <button
            type="button"
            className="w-full flex items-center justify-between group text-left"
            onClick={() => setChartsOpen(!chartsOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold block">
                  [ 05 / АНАЛИТИКА ]
                </span>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  Структура и динамика затрат
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                {chartsOpen ? "СВЕРНУТЬ" : "РАЗВЕРНУТЬ"}
              </span>
              <div className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 group-hover:border-slate-400 transition-colors">
                {chartsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </div>
          </button>
          {chartsOpen && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-5">
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-500 font-semibold mb-4">
                  По категориям
                </h3>
                <CategoryPieChart data={stats.byCategory} />
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-5">
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-500 font-semibold mb-4">
                  Динамика по месяцам
                </h3>
                <MonthlyLineChart data={stats.byMonth} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 06 / Fleet Modules */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
        <ServiceIntervals vehicleId={vehicle.id} currentMileage={vehicle.mileage} />
      </div>

      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
        <TiresManager vehicleId={vehicle.id} currentMileage={vehicle.mileage} />
      </div>

      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
        <PartsInventory vehicleId={vehicle.id} />
      </div>

      {/* 07 / Expenses Journal Section */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            className="flex items-center gap-3 text-left group"
            onClick={() => setExpensesOpen(!expensesOpen)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold">
                  [ 07 / БОРТОВОЙ ЖУРНАЛ ]
                </span>
                <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  {expenses.length}
                </span>
                {!expensesOpen && expenses.length > 0 && (
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {formatAmount(stats?.expensesTotal ?? 0)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                  Расходы и чеки
                </h2>
                <span className="text-xs font-mono text-slate-400">
                  {expensesOpen ? "(нажмите, чтобы скрыть)" : "(нажмите, чтобы раскрыть)"}
                </span>
              </div>
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <ImportDialog vehicleId={vehicle.id} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="rounded-full border-slate-200 dark:border-slate-800 font-mono text-xs font-semibold px-3.5 py-1.5 h-8"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
              CSV
            </Button>
            <PdfReportDialog
              vehicle={vehicle}
              expenses={expenses}
              stats={stats}
              serviceIntervals={serviceIntervals}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-slate-200 dark:border-slate-800 font-mono text-xs font-semibold px-3.5 py-1.5 h-8"
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                  PDF
                </Button>
              }
            />
            <ExpenseDialog
              vehicleId={vehicle.id}
              trigger={
                <Button className="rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-mono text-xs font-bold uppercase tracking-wider px-4 py-1.5 h-8 shadow-xs">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Добавить
                </Button>
              }
            />
          </div>
        </div>

        {expensesOpen && (
          <>
            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Поиск по описанию, категории..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 text-xs sm:text-sm font-medium focus-visible:ring-1"
                />
              </div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="h-10 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 w-full sm:w-[180px] text-xs font-mono font-medium">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={`${sortField}-${sortDir}`}
                onValueChange={(v) => {
                  const [f, d] = v.split("-") as [SortField, SortDir]
                  setSortField(f)
                  setSortDir(d)
                }}
              >
                <SelectTrigger className="h-10 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 w-full sm:w-[200px] text-xs font-mono font-medium">
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="date-desc">Дата: новые</SelectItem>
                  <SelectItem value="date-asc">Дата: старые</SelectItem>
                  <SelectItem value="amount-desc">Сумма: больше</SelectItem>
                  <SelectItem value="amount-asc">Сумма: меньше</SelectItem>
                </SelectContent>
              </Select>
              {catFilter !== "all" && (
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                  Итого: {formatAmount(totalFiltered)}
                </div>
              )}
            </div>

            {/* Expense list grouped by month */}
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-mono">
                Нет расходов. Добавьте первую запись в бортовой журнал!
              </div>
            ) : (
              <div className="space-y-4">
                {groupedByMonth.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => toggleMonth(group.key)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500">
                          {collapsedMonths.has(group.key) ? (
                            <ChevronRight className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className="font-bold uppercase font-mono tracking-tight text-slate-900 dark:text-white">
                          {formatMonthHeader(group.key)}
                        </span>
                        <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                          {group.expenses.length}
                        </span>
                      </div>
                      <span className="font-black font-mono text-slate-950 dark:text-white">
                        {formatAmount(group.total)}
                      </span>
                    </button>

                    {!collapsedMonths.has(group.key) && (
                      <div className="space-y-2 pl-1 sm:pl-2">
                        {group.expenses.map((expense) => (
                          <ExpenseDetailDialog key={expense.id} expense={expense}>
                            <div className="flex items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-4 py-3 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs transition-all cursor-pointer">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                                    {expense.category.name}
                                  </span>
                                  {expense.receiptPhoto && (
                                    <span title="Чек прикреплен" className="inline-flex items-center text-emerald-600">
                                      <Paperclip className="h-3 w-3" />
                                    </span>
                                  )}
                                  {expense.serviceInterval && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-700 dark:text-blue-300">
                                      <Wrench className="h-2.5 w-2.5" />
                                      {expense.serviceInterval.name}
                                    </span>
                                  )}
                                  {expense.description && (
                                    <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                      {expense.description}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1.5 flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(expense.date)}
                                  </span>
                                  {expense.mileage && (
                                    <span className="flex items-center gap-1">
                                      <Gauge className="h-3 w-3" />
                                      {expense.mileage.toLocaleString("ru-RU")} км
                                    </span>
                                  )}
                                  {expense.liters && expense.pricePerLiter && (
                                    <span className="flex items-center gap-1">
                                      <Fuel className="h-3 w-3" />
                                      {expense.liters} л × {expense.pricePerLiter} ₽
                                      {expense.bonuses ? ` (-${expense.bonuses} бонусы)` : ""}
                                    </span>
                                  )}
                                  {expense.parts && expense.parts.length > 0 && (() => {
                                    const partsSum = expense.parts.reduce((s, p) => s + p.quantity * p.price, 0)
                                    return (
                                      <span className="flex items-center gap-1">
                                        <Wrench className="h-3 w-3" />
                                        запчасти {formatAmount(partsSum)}
                                        {expense.laborCost ? ` · работа ${formatAmount(expense.laborCost)}` : ""}
                                      </span>
                                    )
                                  })()}
                                  {!expense.parts?.length && expense.laborCost && (
                                    <span className="flex items-center gap-1">
                                      <Wrench className="h-3 w-3" />
                                      работа {formatAmount(expense.laborCost)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <span className="font-black font-mono text-sm sm:text-base text-slate-950 dark:text-white">
                                  {formatAmount(expense.amount)}
                                </span>
                                <ExpenseDialog
                                  vehicleId={vehicle.id}
                                  expense={expense}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (confirm("Удалить расход?")) {
                                      deleteExpense.mutate(expense.id)
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </ExpenseDetailDialog>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed mobile button */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center sm:hidden z-50 px-4">
        <ExpenseDialog
          vehicleId={vehicle.id}
          trigger={
            <Button className="w-full max-w-sm rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-mono text-xs font-bold uppercase tracking-wider py-3 shadow-xl backdrop-blur-md">
              <Plus className="mr-2 h-4 w-4" />
              Добавить расход
            </Button>
          }
        />
      </div>
      {/* Ivanych AI Assistant */}
      <IvanychWidget vehicle={vehicle} />
    </div>
  )
}
