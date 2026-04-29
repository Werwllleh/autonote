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
import { Calendar, Gauge, Fuel, Wrench, Shield, Droplets } from "lucide-react"

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
          // Don't open if clicking on buttons inside
          if ((e.target as HTMLElement).closest("button")) return
          setOpen(true)
        }}
      >
        {children}
      </div>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md max-sm:!top-auto max-sm:!bottom-0 max-sm:!translate-y-0 max-sm:!translate-x-[-50%] max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge>{expense.category.name}</Badge>
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
