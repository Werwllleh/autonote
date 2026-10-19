import { useState, useRef, type ReactNode } from "react"
import { Printer, Car, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Vehicle } from "@/api/vehicles"
import type { Expense } from "@/api/expenses"
import type { ServiceInterval } from "@/api/service-intervals"

interface PdfReportDialogProps {
  vehicle: Vehicle
  expenses: Expense[]
  stats?: {
    total: number
    expensesTotal: number
    stockValue: number
    costPerKm: number | null
    avgLitersPer100km: number | null
    avgFuelCostPer100km: number | null
    byCategory: Record<string, number>
  } | null
  serviceIntervals?: ServiceInterval[]
  trigger?: ReactNode
}

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

export function PdfReportDialog({
  vehicle,
  expenses,
  stats,
  serviceIntervals = [],
  trigger,
}: PdfReportDialogProps) {
  const [open, setOpen] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  // Calculate category breakdowns
  const totalAmount = stats?.total ?? expenses.reduce((s, e) => s + e.amount, 0)
  const categoryTotals: Record<string, number> = stats?.byCategory ?? {}
  if (Object.keys(categoryTotals).length === 0) {
    for (const e of expenses) {
      categoryTotals[e.category.name] = (categoryTotals[e.category.name] || 0) + e.amount
    }
  }

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Printer className="mr-1.5 h-4 w-4" />
            <span>PDF / Печать</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/40 shrink-0 no-print">
          <div>
            <h3 className="font-semibold text-sm">Предпросмотр отчёта для печати / PDF</h3>
            <p className="text-xs text-muted-foreground">
              Форматированный документ для распечатки или сохранения в PDF при продаже авто
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-4 w-4" />
              <span>Сохранить в PDF / Распечатать</span>
            </Button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-zinc-950 font-sans print:p-0 print:overflow-visible">
          <div ref={reportRef} className="space-y-6 max-w-3xl mx-auto printable-document">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-zinc-900">AutoNotes</h1>
                  <p className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
                    Сервисный отчёт автомобиля
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-zinc-600">
                <p>Дата отчёта: {new Date().toLocaleDateString("ru-RU")}</p>
                <p className="font-mono text-[11px] text-zinc-500 mt-0.5">ID: {vehicle.id.slice(0, 8)}</p>
              </div>
            </div>

            {/* Vehicle Profile Banner */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 pb-3 mb-3">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Год выпуска: <span className="font-semibold text-zinc-900">{vehicle.year}</span>
                    {vehicle.licensePlate && (
                      <> • Госномер: <span className="font-semibold text-zinc-900 font-mono">{vehicle.licensePlate}</span></>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Текущий пробег</span>
                  <p className="text-lg font-bold text-zinc-900">
                    {vehicle.mileage.toLocaleString("ru-RU")} км
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {vehicle.vin && (
                  <div>
                    <span className="text-zinc-500 block">VIN:</span>
                    <span className="font-mono font-medium">{vehicle.vin}</span>
                  </div>
                )}
                {vehicle.registrationNumber && (
                  <div>
                    <span className="text-zinc-500 block">СТС / ПТС:</span>
                    <span className="font-medium">{vehicle.registrationNumber}</span>
                  </div>
                )}
                {vehicle.purchaseDate && (
                  <div>
                    <span className="text-zinc-500 block">Дата покупки:</span>
                    <span className="font-medium">{formatDate(vehicle.purchaseDate)}</span>
                  </div>
                )}
                {vehicle.purchasePrice && (
                  <div>
                    <span className="text-zinc-500 block">Цена покупки:</span>
                    <span className="font-medium">{formatAmount(vehicle.purchasePrice)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary KPIs */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 mb-2.5">
                Финансовые показатели
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/50">
                  <span className="text-[11px] text-zinc-500 block">Всего расходов</span>
                  <span className="text-base font-bold text-zinc-900">{formatAmount(totalAmount)}</span>
                </div>
                <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/50">
                  <span className="text-[11px] text-zinc-500 block">Количество записей</span>
                  <span className="text-base font-bold text-zinc-900">{expenses.length}</span>
                </div>
                {stats?.costPerKm != null && (
                  <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/50">
                    <span className="text-[11px] text-zinc-500 block">Стоимость 1 км</span>
                    <span className="text-base font-bold text-zinc-900">{stats.costPerKm.toFixed(1)} ₽</span>
                  </div>
                )}
                {stats?.avgLitersPer100km != null && (
                  <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/50">
                    <span className="text-[11px] text-zinc-500 block">Расход топлива</span>
                    <span className="text-base font-bold text-zinc-900">{stats.avgLitersPer100km} л / 100 км</span>
                  </div>
                )}
              </div>

              {/* Category distribution */}
              {Object.keys(categoryTotals).length > 0 && (
                <div className="mt-3 rounded-lg border border-zinc-200 overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-zinc-100 font-semibold text-zinc-700 py-1.5 px-3">
                    <span className="col-span-8">Категория трат</span>
                    <span className="col-span-4 text-right">Сумма (₽)</span>
                  </div>
                  <div className="divide-y divide-zinc-200">
                    {Object.entries(categoryTotals)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, sum]) => (
                        <div key={name} className="grid grid-cols-12 py-1.5 px-3">
                          <span className="col-span-8 text-zinc-800">{name}</span>
                          <span className="col-span-4 text-right font-medium text-zinc-900">
                            {formatAmount(sum)} ({totalAmount > 0 ? Math.round((sum / totalAmount) * 100) : 0}%)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Intervals Table */}
            {serviceIntervals.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 mb-2.5">
                  Регламентное техническое обслуживание (ТО)
                </h3>
                <div className="rounded-lg border border-zinc-200 overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-zinc-100 font-semibold text-zinc-700 py-2 px-3">
                    <span className="col-span-5">Регламент</span>
                    <span className="col-span-3">Интервал</span>
                    <span className="col-span-4 text-right">Последнее обслуживание</span>
                  </div>
                  <div className="divide-y divide-zinc-200">
                    {serviceIntervals.map((si) => {
                      const intervalParts: string[] = []
                      if (si.intervalKm) intervalParts.push(`${si.intervalKm.toLocaleString("ru-RU")} км`)
                      if (si.intervalMonths) intervalParts.push(`${si.intervalMonths} мес.`)

                      const lastParts: string[] = []
                      if (si.lastServiceMileage != null) lastParts.push(`${si.lastServiceMileage.toLocaleString("ru-RU")} км`)
                      if (si.lastServiceDate) lastParts.push(new Date(si.lastServiceDate).toLocaleDateString("ru-RU"))

                      return (
                        <div key={si.id} className="grid grid-cols-12 py-1.5 px-3">
                          <span className="col-span-5 font-medium text-zinc-900">{si.name}</span>
                          <span className="col-span-3 text-zinc-600">{intervalParts.join(" / ") || "—"}</span>
                          <span className="col-span-4 text-right text-zinc-800">
                            {lastParts.join(", ") || "Нет отметок"}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Chronological Expenses Log */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 mb-2.5">
                Журнал обслуживания и расходов ({sortedExpenses.length})
              </h3>
              <div className="rounded-lg border border-zinc-200 overflow-hidden text-xs">
                <div className="grid grid-cols-12 bg-zinc-100 font-semibold text-zinc-700 py-2 px-3">
                  <span className="col-span-2">Дата</span>
                  <span className="col-span-3">Категория</span>
                  <span className="col-span-2 text-right">Пробег</span>
                  <span className="col-span-3 pl-3">Описание / Запчасти</span>
                  <span className="col-span-2 text-right">Сумма</span>
                </div>
                <div className="divide-y divide-zinc-200">
                  {sortedExpenses.map((exp) => {
                    const partsDesc = Array.isArray(exp.parts) && exp.parts.length > 0
                      ? exp.parts.map((p) => `${p.name}${p.article ? ` [${p.article}]` : ""}`).join(", ")
                      : ""
                    const fullDesc = [exp.description, partsDesc ? `Детали: ${partsDesc}` : ""]
                      .filter(Boolean)
                      .join(". ")

                    return (
                      <div key={exp.id} className="grid grid-cols-12 py-2 px-3 items-center">
                        <span className="col-span-2 text-zinc-700">
                          {new Date(exp.date).toLocaleDateString("ru-RU")}
                        </span>
                        <span className="col-span-3 font-medium text-zinc-900">
                          {exp.category.name}
                        </span>
                        <span className="col-span-2 text-right text-zinc-600 font-mono">
                          {exp.mileage ? `${exp.mileage.toLocaleString("ru-RU")} км` : "—"}
                        </span>
                        <span className="col-span-3 pl-3 text-zinc-600 truncate" title={fullDesc}>
                          {fullDesc || "—"}
                        </span>
                        <span className="col-span-2 text-right font-semibold text-zinc-900">
                          {formatAmount(exp.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-12 bg-zinc-50 font-bold text-zinc-900 py-2.5 px-3 border-t-2 border-zinc-300">
                  <span className="col-span-7">ИТОГО ПО ВСЕМ ЗАПИСЯМ</span>
                  <span className="col-span-5 text-right">{formatAmount(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Document Verification Footer */}
            <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Сертифицированная история обслуживания в системе AutoNotes</span>
              </div>
              <div className="text-right">
                <span>https://auto-notes.ru</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
