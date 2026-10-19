import { useState } from "react"
import type { Expense } from "@/api/expenses"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Gauge, Fuel, Wrench, Shield, Droplets, Paperclip } from "lucide-react"

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

interface ExpenseDetailDialogProps {
  expense: Expense
  children: React.ReactNode
}

export function ExpenseDetailDialog({ expense, children }: ExpenseDetailDialogProps) {
  const [open, setOpen] = useState(false)

  const isFuel = expense.category.slug === "fuel"
  const isMaintenance = expense.category.slug === "maintenance"
  const isInsurance = expense.category.slug === "insurance"

  const partsSum = expense.parts?.reduce((s, p) => s + p.quantity * p.price, 0) ?? 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        className="cursor-pointer"
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (target.closest("button")) return
          if (target.closest('[role="dialog"]')) return
          setOpen(true)
        }}
      >
        {children}
      </div>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <Badge variant="secondary">{expense.category.name}</Badge>
            <span className="text-2xl font-black font-mono tracking-tight text-slate-950 dark:text-white">
              {formatAmount(expense.amount)}
            </span>
          </div>
          <DialogTitle className="sr-only">Детали расхода</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{formatDate(expense.date)}</span>
            </div>
            {expense.mileage && (
              <div className="flex items-center gap-2 text-slate-500">
                <Gauge className="h-4 w-4 shrink-0 text-slate-400" />
                <span>{expense.mileage.toLocaleString("ru-RU")} км</span>
              </div>
            )}
            {expense.serviceInterval && (
              <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 font-mono font-medium col-span-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl px-3 py-2 border border-blue-200 dark:border-blue-800">
                <Wrench className="h-3.5 w-3.5 shrink-0" />
                <span>Регламент ТО: {expense.serviceInterval.name}</span>
              </div>
            )}
          </div>

          {expense.description && (
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {expense.description}
            </p>
          )}

          {/* Fuel details */}
          {isFuel && expense.liters && expense.pricePerLiter && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-amber-500" />
                  Топливо
                </h4>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4 space-y-2 text-xs font-mono">
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
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-slate-400" />
                  ТО
                </h4>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4 space-y-2.5 text-xs font-mono">
                  {expense.parts && expense.parts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                        Запчасти
                      </span>
                      {expense.parts.map((part, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            {part.article && (
                              <span className="font-mono text-[11px] mr-1 text-slate-400 font-bold">{part.article}</span>
                            )}
                            {part.name}
                            {part.quantity > 1 && ` × ${part.quantity}`}
                          </span>
                          <span className="shrink-0 ml-2 font-bold text-slate-900 dark:text-slate-100">{formatAmount(part.quantity * part.price)}</span>
                        </div>
                      ))}
                      {expense.parts.length > 1 && (
                        <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-slate-500">Запчасти итого</span>
                          <span>{formatAmount(partsSum)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {expense.laborCost != null && expense.laborCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Работа</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatAmount(expense.laborCost)}</span>
                    </div>
                  )}
                  {expense.parts && expense.parts.length > 0 && expense.laborCost != null && expense.laborCost > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between font-black text-sm">
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
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Полис
                </h4>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4 space-y-2 text-xs font-mono">
                  {expense.dateFrom && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Начало</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatDate(expense.dateFrom)}</span>
                    </div>
                  )}
                  {expense.dateTo && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Окончание</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatDate(expense.dateTo)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Receipt photo */}
          {expense.receiptPhoto && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-emerald-500" />
                  Прикрепленный чек / заказ-наряд
                </h4>
                <a
                  href={expense.receiptPhoto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="p-2 flex items-center justify-center bg-black/5 dark:bg-white/5">
                    <img
                      src={expense.receiptPhoto}
                      alt="Чек"
                      className="max-h-72 rounded-xl object-contain group-hover:scale-[1.01] transition-transform"
                    />
                  </div>
                  <div className="p-2.5 text-center text-xs font-mono text-slate-600 dark:text-slate-300 font-medium border-t border-slate-200 dark:border-slate-800">
                    Открыть фото в полном размере ↗
                  </div>
                </a>
              </div>
            </>
          )}

          {/* Meta */}
          <div className="text-xs text-muted-foreground pt-1">
            Создано: {formatDate(expense.createdAt)}
            {expense.updatedAt !== expense.createdAt && (
              <> · Обновлено: {formatDate(expense.updatedAt)}</>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
