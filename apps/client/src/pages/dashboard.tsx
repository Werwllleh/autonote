import { useState, useMemo } from "react"
import { useVehicles } from "@/hooks/use-vehicles"
import { useExpenses } from "@/hooks/use-expenses"
import { useCategories } from "@/hooks/use-categories"
import { useOverallStats } from "@/hooks/use-stats"
import { VehicleCard } from "@/components/vehicle-card"
import { AddVehicleDialog } from "@/components/add-vehicle-dialog"
import { CategoryPieChart } from "@/components/charts/category-pie-chart"
import { MonthlyLineChart } from "@/components/charts/monthly-line-chart"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Search, LayoutGrid, List, ArrowUpDown, Car, Receipt } from "lucide-react"

type ViewMode = "grid" | "list"
type SortOrder = "desc" | "asc" | "name"

function formatAmount(amount: number) {
  return amount.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
}

export function DashboardPage() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: categories = [] } = useCategories()
  const { data: stats } = useOverallStats()

  const isLoading = vehiclesLoading || expensesLoading

  // Compute totals per vehicle and top category
  const vehicleStats = useMemo(() => {
    const map = new Map<string, { total: number; byCat: Map<string, number> }>()
    for (const exp of expenses) {
      let entry = map.get(exp.vehicleId)
      if (!entry) {
        entry = { total: 0, byCat: new Map() }
        map.set(exp.vehicleId, entry)
      }
      entry.total += exp.amount
      entry.byCat.set(
        exp.category.name,
        (entry.byCat.get(exp.category.name) || 0) + exp.amount,
      )
    }
    return map
  }, [expenses])

  // Which categories actually have expenses
  const activeCategories = useMemo(() => {
    const slugs = new Set(expenses.map((e) => e.category.slug))
    return categories.filter((c) => slugs.has(c.slug))
  }, [expenses, categories])

  // Filter + sort vehicles
  const filtered = useMemo(() => {
    let list = vehicles

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (v) =>
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q),
      )
    }

    if (categoryFilter !== "all") {
      const catName = categories.find((c) => c.slug === categoryFilter)?.name
      if (catName) {
        list = list.filter((v) => {
          const stats = vehicleStats.get(v.id)
          return stats?.byCat.has(catName)
        })
      }
    }

    list = [...list].sort((a, b) => {
      if (sortOrder === "name") {
        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
      }
      const totalA = vehicleStats.get(a.id)?.total || 0
      const totalB = vehicleStats.get(b.id)?.total || 0
      return sortOrder === "desc" ? totalB - totalA : totalA - totalB
    })

    return list
  }, [vehicles, search, categoryFilter, sortOrder, vehicleStats, categories])

  const getTopCategory = (vehicleId: string) => {
    const s = vehicleStats.get(vehicleId)
    if (!s || s.byCat.size === 0) return undefined
    let max = 0
    let top = ""
    s.byCat.forEach((amount, name) => {
      if (amount > max) {
        max = amount
        top = name
      }
    })
    return top
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои автомобили</h1>
        <AddVehicleDialog />
      </div>

      {/* Overall stats */}
      {stats && stats.count > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Receipt className="h-3 w-3" />
                  Всего расходов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatAmount(stats.total)}</p>
                <p className="text-xs text-muted-foreground">{stats.count} записей</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  Автомобилей
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </CardContent>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Среднее / месяц
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatAmount(
                    Object.keys(stats.byMonth).length > 0
                      ? stats.total / Object.keys(stats.byMonth).length
                      : 0,
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">По категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={stats.byCategory} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Динамика расходов</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyLineChart data={stats.byMonth} />
              </CardContent>
            </Card>
          </div>

          <Separator />
        </>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {activeCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
          <SelectTrigger className="w-[200px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Расходы: больше</SelectItem>
            <SelectItem value="asc">Расходы: меньше</SelectItem>
            <SelectItem value="name">По названию</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Загрузка...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">
            {vehicles.length === 0
              ? "Нет автомобилей. Добавьте первый!"
              : "Ничего не найдено"}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              totalExpenses={vehicleStats.get(v.id)?.total || 0}
              topCategory={getTopCategory(v.id)}
              view="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              totalExpenses={vehicleStats.get(v.id)?.total || 0}
              topCategory={getTopCategory(v.id)}
              view="list"
            />
          ))}
        </div>
      )}
    </div>
  )
}
