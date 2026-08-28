import { useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Car,
  Gauge,
  Calendar,
  Receipt,
  Fuel,
  Wrench,
  Shield,
  Clock,
  AlertTriangle,
  Search,
  X,
  Droplets,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import type { PublicReport, PublicReportExpense } from "@/api/reports"
import { reportsApi } from "@/api/reports"

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
    month: "long",
    year: "numeric",
  })
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function CategoryIcon({ slug }: { slug: string }) {
  if (slug === "fuel") return <Fuel className="h-3.5 w-3.5" />
  if (slug === "maintenance" || slug === "repair") return <Wrench className="h-3.5 w-3.5" />
  if (slug === "insurance") return <Shield className="h-3.5 w-3.5" />
  return <Receipt className="h-3.5 w-3.5" />
}

interface ExpenseDialogProps {
  expense: PublicReportExpense
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PublicExpenseDialog({ expense, open, onOpenChange }: ExpenseDialogProps) {
  const isFuel = expense.categorySlug === "fuel"
  const isMaintenance = expense.categorySlug === "maintenance"
  const isInsurance = expense.categorySlug === "insurance"

  const partsSum = expense.parts?.reduce((s, p) => s + p.quantity * p.price, 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md max-sm:!top-auto max-sm:!bottom-0 max-sm:!translate-y-0 max-sm:!translate-x-[-50%] max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge>{expense.category}</Badge>
            <span className="text-2xl font-bold">{formatAmount(expense.amount)}</span>
          </div>
          <DialogTitle className="sr-only">Детали расхода</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatDate(expense.date)}</span>
            </div>
            {expense.mileage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gauge className="h-4 w-4 shrink-0" />
                <span>{expense.mileage.toLocaleString("ru-RU")} км</span>
              </div>
            )}
          </div>

          {expense.description && (
            <p className="text-sm">{expense.description}</p>
          )}

          {/* Fuel details */}
          {isFuel && expense.liters && expense.pricePerLiter && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  Топливо
                </h4>
                <div className="rounded-lg bg-muted p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Droplets className="h-3.5 w-3.5" />
                      Объём
                    </span>
                    <span>{expense.liters} л</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Цена за литр</span>
                    <span>{expense.pricePerLiter.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Полная стоимость</span>
                    <span>{formatAmount(expense.liters * expense.pricePerLiter)}</span>
                  </div>
                  {expense.bonuses != null && expense.bonuses > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-600">
                        <span>Бонусы</span>
                        <span>−{formatAmount(expense.bonuses)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Итого</span>
                        <span>{formatAmount(expense.amount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Maintenance details */}
          {isMaintenance && (expense.parts?.length || expense.laborCost) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  ТО
                </h4>
                <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
                  {expense.parts && expense.parts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Запчасти
                      </span>
                      {expense.parts.map((part, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {part.article && (
                              <span className="font-mono text-xs mr-1">{part.article}</span>
                            )}
                            {part.name}
                            {part.quantity > 1 && ` × ${part.quantity}`}
                          </span>
                          <span className="shrink-0 ml-2">{formatAmount(part.quantity * part.price)}</span>
                        </div>
                      ))}
                      {expense.parts.length > 1 && (
                        <div className="flex justify-between font-medium pt-1 border-t border-border/50">
                          <span className="text-muted-foreground">Запчасти итого</span>
                          <span>{formatAmount(partsSum)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {expense.laborCost != null && expense.laborCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Работа</span>
                      <span>{formatAmount(expense.laborCost)}</span>
                    </div>
                  )}
                  {expense.parts && expense.parts.length > 0 && expense.laborCost != null && expense.laborCost > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Итого</span>
                        <span>{formatAmount(expense.amount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Insurance details */}
          {isInsurance && (expense.dateFrom || expense.dateTo) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Полис
                </h4>
                <div className="rounded-lg bg-muted p-3 space-y-1.5 text-sm">
                  {expense.dateFrom && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Начало</span>
                      <span>{formatDate(expense.dateFrom)}</span>
                    </div>
                  )}
                  {expense.dateTo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Окончание</span>
                      <span>{formatDate(expense.dateTo)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PublicReportPage() {
  const { token } = useParams<{ token: string }>()
  const [report, setReport] = useState<PublicReport | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selected, setSelected] = useState<PublicReportExpense | null>(null)

  const expenses = report?.expenses ?? []

  const categories = useMemo(() => {
    const set = new Set<string>()
    expenses.forEach((e) => set.add(e.category))
    return Array.from(set).sort()
  }, [expenses])

  const filtered = useMemo(() => {
    let list = expenses
    if (catFilter !== "all") {
      list = list.filter((e) => e.category === catFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q),
      )
    }
    if (dateFrom) {
      list = list.filter((e) => e.date.slice(0, 10) >= dateFrom)
    }
    if (dateTo) {
      list = list.filter((e) => e.date.slice(0, 10) <= dateTo)
    }
    return list
  }, [expenses, catFilter, search, dateFrom, dateTo])

  const hasFilters = catFilter !== "all" || search || dateFrom || dateTo
  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0)

  const filteredByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of filtered) {
      map[e.category] = (map[e.category] || 0) + e.amount
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [filtered])

  const clearFilters = () => {
    setCatFilter("all")
    setSearch("")
    setDateFrom("")
    setDateTo("")
  }

  useEffect(() => {
    if (!token) return
    reportsApi
      .get(token)
      .then(setReport)
      .catch((err) => {
        const status = err?.response?.status
        if (status === 410) setError("Срок действия ссылки истёк")
        else if (status === 404) setError("Отчёт не найден")
        else setError("Ошибка загрузки")
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Загрузка отчёта...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="py-12 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold">{error}</h2>
            <p className="text-sm text-muted-foreground">
              Попросите владельца создать новую ссылку.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) return null

  const { vehicle } = report

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="https://auto-notes.ru" className="flex items-center gap-2 font-medium text-foreground hover:opacity-80 transition-opacity">
              <Car className="h-4 w-4" />
              AutoNotes
            </a>
            <span>&middot;</span>
            <span>Публичный отчёт</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Vehicle card */}
        <div className="flex items-center gap-4">
          {vehicle.photo ? (
            <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden">
              <img src={`/api${vehicle.photo}`} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <Car className="h-8 w-8 text-primary/60" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <span>{vehicle.year} г.</span>
              <span className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                {vehicle.mileage.toLocaleString("ru-RU")} км
              </span>
              {vehicle.vin && (
                <span className="font-mono text-xs">{vehicle.vin}</span>
              )}
            </div>
          </div>
        </div>

        {/* Summary — reacts to filters */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
            <CardContent className="relative py-4 text-center">
              <p className="text-xs text-muted-foreground">Записей</p>
              <p className="text-xl font-bold mt-1">{filtered.length}</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            <CardContent className="relative py-4 text-center">
              <p className="text-xs text-muted-foreground">Пробег</p>
              <p className="text-xl font-bold mt-1">
                {vehicle.mileage.toLocaleString("ru-RU")} км
              </p>
            </CardContent>
          </Card>
        </div>

        {/* By category — reacts to filters */}
        {filteredByCategory.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">По категориям</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredByCategory.map(([cat, amount]) => {
                const pct = filteredTotal > 0 ? (amount / filteredTotal) * 100 : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat}</span>
                      <span className="font-medium">{formatAmount(amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[150px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[140px] h-9"
            placeholder="От"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[140px] h-9"
            placeholder="До"
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2">
              <X className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          )}
        </div>

        <Separator />

        {/* Expense history — filtered, collapsible */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center gap-2 text-left"
          >
            {historyOpen ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <Receipt className="h-5 w-5 text-muted-foreground shrink-0" />
            <h2 className="text-lg font-semibold">История расходов</h2>
            <span className="text-sm font-normal text-muted-foreground">
              {hasFilters ? `(${filtered.length} из ${expenses.length})` : `(${filtered.length})`}
            </span>
          </button>

          {historyOpen && (
            filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {hasFilters ? "Ничего не найдено" : "Нет записей"}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((e, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(e)}
                  className="rounded-lg border px-3 py-3 cursor-pointer transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <CategoryIcon slug={e.categorySlug} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{e.category}</Badge>
                          {e.description && (
                            <span className="text-sm text-muted-foreground truncate">{e.description}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-sm shrink-0">{formatAmount(e.amount)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground ml-9">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatShortDate(e.date)}
                    </span>
                    {e.mileage && (
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {e.mileage.toLocaleString("ru-RU")} км
                      </span>
                    )}
                    {e.liters && e.pricePerLiter && (
                      <span>{e.liters} л × {e.pricePerLiter} ₽</span>
                    )}
                    {e.parts && e.parts.length > 0 && (
                      <span>{e.parts.length} запч.</span>
                    )}
                    {e.laborCost && (
                      <span>работа {formatAmount(e.laborCost)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
          )}
        </div>

        {selected && (
          <PublicExpenseDialog
            expense={selected}
            open={!!selected}
            onOpenChange={(o) => !o && setSelected(null)}
          />
        )}

        {/* Footer */}
        <div className="text-center space-y-2 py-6">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Ссылка действительна до {formatDate(report.expiresAt)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Сформировано в <a href="https://auto-notes.ru" className="text-primary hover:underline">AutoNotes</a>
          </p>
        </div>
      </div>
    </div>
  )
}
