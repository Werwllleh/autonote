import { useMemo } from "react"
import { AlertTriangle, ShieldAlert, Wrench, Shield, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExpenseDialog } from "@/components/expense-dialog"
import type { Expense } from "@/api/expenses"
import type { ServiceInterval } from "@/api/service-intervals"

interface VehicleAlertsProps {
  vehicleId: string
  currentMileage: number
  expenses: Expense[]
  serviceIntervals: ServiceInterval[]
}

interface AlertItem {
  id: string
  type: "service" | "insurance"
  title: string
  detail: string
  urgency: "critical" | "warning"
  serviceIntervalId?: string
  actionLabel: string
  categorySlug: "maintenance" | "insurance"
}

export function VehicleAlerts({
  vehicleId,
  currentMileage,
  expenses,
  serviceIntervals,
}: VehicleAlertsProps) {
  const alerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = []
    const now = Date.now()

    // 1. Service intervals check
    for (const si of serviceIntervals) {
      const kmRemaining =
        si.intervalKm && si.lastServiceMileage !== null
          ? si.lastServiceMileage + si.intervalKm - currentMileage
          : null

      let daysRemaining: number | null = null
      let dueDateStr: string | null = null
      if (si.intervalMonths && si.lastServiceDate) {
        const next = new Date(si.lastServiceDate)
        next.setMonth(next.getMonth() + si.intervalMonths)
        daysRemaining = Math.ceil((next.getTime() - now) / (1000 * 60 * 60 * 24))
        dueDateStr = next.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
      }

      const isOverdueKm = kmRemaining !== null && kmRemaining <= 0
      const isOverdueDays = daysRemaining !== null && daysRemaining <= 0
      const isOverdue = isOverdueKm || isOverdueDays

      const warningKmThreshold = si.intervalKm ? Math.max(1000, Math.round(si.intervalKm * 0.1)) : 1000
      const isWarningKm = !isOverdue && kmRemaining !== null && kmRemaining <= warningKmThreshold
      const isWarningDays = !isOverdue && daysRemaining !== null && daysRemaining <= 30

      if (isOverdue) {
        const reasons: string[] = []
        if (isOverdueKm && kmRemaining !== null) {
          reasons.push(`на ${Math.abs(kmRemaining).toLocaleString("ru-RU")} км`)
        }
        if (isOverdueDays && daysRemaining !== null) {
          reasons.push(`на ${Math.abs(daysRemaining)} дн.`)
        }
        list.push({
          id: `service-overdue-${si.id}`,
          type: "service",
          title: `ТО: ${si.name}`,
          detail: `Просрочено ${reasons.join(" и ")}`,
          urgency: "critical",
          serviceIntervalId: si.id,
          actionLabel: "Записать ТО",
          categorySlug: "maintenance",
        })
      } else if (isWarningKm || isWarningDays) {
        const remainingParts: string[] = []
        if (kmRemaining !== null && isWarningKm) {
          remainingParts.push(`${kmRemaining.toLocaleString("ru-RU")} км`)
        }
        if (daysRemaining !== null && isWarningDays) {
          remainingParts.push(`${daysRemaining} дн.${dueDateStr ? ` (до ${dueDateStr})` : ""}`)
        }
        list.push({
          id: `service-warn-${si.id}`,
          type: "service",
          title: `ТО: ${si.name}`,
          detail: `Осталось ${remainingParts.join(" или ")}`,
          urgency: "warning",
          serviceIntervalId: si.id,
          actionLabel: "Записать ТО",
          categorySlug: "maintenance",
        })
      }
    }

    // 2. Insurance expiration check
    const insuranceExpenses = expenses
      .filter((e) => e.category.slug === "insurance" && e.dateTo)
      .sort((a, b) => new Date(b.dateTo!).getTime() - new Date(a.dateTo!).getTime())

    if (insuranceExpenses.length > 0) {
      const latest = insuranceExpenses[0]
      const expDate = new Date(latest.dateTo!)
      const daysRemaining = Math.ceil((expDate.getTime() - now) / (1000 * 60 * 60 * 24))
      const expDateStr = expDate.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })

      if (daysRemaining < 0) {
        list.push({
          id: `insurance-expired-${latest.id}`,
          type: "insurance",
          title: "Страховка: срок действия истек",
          detail: `Истекла ${Math.abs(daysRemaining)} дн. назад (${expDateStr})`,
          urgency: "critical",
          actionLabel: "Продлить",
          categorySlug: "insurance",
        })
      } else if (daysRemaining <= 30) {
        list.push({
          id: `insurance-expiring-${latest.id}`,
          type: "insurance",
          title: "Страховка: подходит срок окончания",
          detail: `Осталось ${daysRemaining} ${daysRemaining === 1 ? "день" : daysRemaining < 5 ? "дня" : "дней"} (до ${expDateStr})`,
          urgency: daysRemaining <= 7 ? "critical" : "warning",
          actionLabel: "Продлить",
          categorySlug: "insurance",
        })
      }
    }

    // Sort critical first
    return list.sort((a, b) => (a.urgency === b.urgency ? 0 : a.urgency === "critical" ? -1 : 1))
  }, [vehicleId, currentMileage, expenses, serviceIntervals])

  if (alerts.length === 0) return null

  const hasCritical = alerts.some((a) => a.urgency === "critical")

  return (
    <Card
      className={`relative overflow-hidden transition-all rounded-3xl ${
        hasCritical
          ? "border-destructive/40 bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent shadow-sm"
          : "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent shadow-sm"
      }`}
    >
      <CardContent className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                hasCritical ? "bg-destructive/20 text-destructive" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}
            >
              {hasCritical ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight">
                {hasCritical ? "Требуется внимание" : "Напоминания"}
              </span>
            </div>
          </div>
          <Badge
            variant={hasCritical ? "destructive" : "secondary"}
            className={!hasCritical ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" : ""}
          >
            {alerts.length} {alerts.length === 1 ? "событие" : alerts.length < 5 ? "события" : "событий"}
          </Badge>
        </div>

        <div className="divide-y divide-border/60">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 first:pt-1 last:pb-0"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 text-muted-foreground">
                  {alert.type === "service" ? (
                    <Wrench className="h-4 w-4 text-primary/70" />
                  ) : (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium leading-none">{alert.title}</p>
                    {alert.urgency === "critical" ? (
                      <span className="inline-flex items-center text-[10px] uppercase font-semibold text-destructive px-1.5 py-0.5 rounded bg-destructive/10">
                        Просрочено
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">
                        Скоро
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alert.detail}</p>
                </div>
              </div>

              <div className="flex justify-end shrink-0 pl-6 sm:pl-0">
                <ExpenseDialog
                  vehicleId={vehicleId}
                  defaultCategorySlug={alert.categorySlug}
                  defaultServiceIntervalId={alert.serviceIntervalId}
                  trigger={
                    <Button
                      size="sm"
                      variant={alert.urgency === "critical" ? "destructive" : "outline"}
                      className="h-7 text-xs px-2.5"
                    >
                      <span>{alert.actionLabel}</span>
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
