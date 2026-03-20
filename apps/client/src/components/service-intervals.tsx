import { useState, type FormEvent } from "react"
import {
  useServiceIntervals,
  useCreateServiceInterval,
  useUpdateServiceInterval,
  useDeleteServiceInterval,
} from "@/hooks/use-service-intervals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Timer, ChevronDown, ChevronRight } from "lucide-react"

interface Props {
  vehicleId: string
  currentMileage: number
}

export function ServiceIntervals({ vehicleId, currentMileage }: Props) {
  const { data: intervals = [] } = useServiceIntervals(vehicleId)
  const [open, setOpen] = useState(false)

  if (intervals.length === 0 && !open) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Регламент ТО</h2>
          </div>
          <AddIntervalDialog vehicleId={vehicleId} currentMileage={currentMileage} />
        </div>
        <p className="text-sm text-muted-foreground py-4 text-center">
          Нет запланированных ТО. Добавьте интервалы обслуживания.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Timer className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Регламент ТО</h2>
          <Badge variant="secondary">{intervals.length}</Badge>
        </button>
        <AddIntervalDialog vehicleId={vehicleId} currentMileage={currentMileage} />
      </div>

      {open && (
        <div className="space-y-2">
          {intervals.map((si) => {
            const remaining = si.intervalKm && si.lastServiceMileage !== null
              ? si.lastServiceMileage + si.intervalKm - currentMileage
              : null

            const nextDate = si.intervalMonths && si.lastServiceDate
              ? (() => {
                  const d = new Date(si.lastServiceDate)
                  d.setMonth(d.getMonth() + si.intervalMonths)
                  return d
                })()
              : null

            const isOverdueKm = remaining !== null && remaining <= 0
            const isOverdueDate = nextDate !== null && nextDate < new Date()
            const isWarningKm = remaining !== null && !isOverdueKm && si.intervalKm && remaining <= si.intervalKm * 0.1
            const isWarningDate = nextDate !== null && !isOverdueDate && nextDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000

            return (
              <div key={si.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{si.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {si.intervalKm && (
                      <span className={isOverdueKm ? "text-destructive font-medium" : isWarningKm ? "text-amber-500 font-medium" : ""}>
                        {remaining !== null && (
                          remaining > 0
                            ? `через ${remaining.toLocaleString("ru-RU")} км`
                            : `просрочено на ${Math.abs(remaining).toLocaleString("ru-RU")} км`
                        )}
                        {remaining === null && `каждые ${si.intervalKm.toLocaleString("ru-RU")} км`}
                      </span>
                    )}
                    {nextDate && (
                      <span className={isOverdueDate ? "text-destructive font-medium" : isWarningDate ? "text-amber-500 font-medium" : ""}>
                        {isOverdueDate
                          ? `просрочено с ${nextDate.toLocaleDateString("ru-RU")}`
                          : `до ${nextDate.toLocaleDateString("ru-RU")}`
                        }
                      </span>
                    )}
                    {si.lastServiceMileage !== null && (
                      <span>посл.: {si.lastServiceMileage.toLocaleString("ru-RU")} км</span>
                    )}
                  </div>
                </div>
                <IntervalActions interval={si} currentMileage={currentMileage} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function IntervalActions({ interval, currentMileage }: {
  interval: { id: string; name: string; intervalKm: number | null; intervalMonths: number | null; lastServiceDate: string | null; lastServiceMileage: number | null }
  currentMileage: number
}) {
  const del = useDeleteServiceInterval()
  const update = useUpdateServiceInterval()

  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Отметить выполненным"
        onClick={() => {
          update.mutate({
            id: interval.id,
            lastServiceDate: new Date().toISOString(),
            lastServiceMileage: currentMileage,
          })
        }}
      >
        <span className="text-xs">✓</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          if (confirm("Удалить интервал?")) del.mutate(interval.id)
        }}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}

function AddIntervalDialog({ vehicleId, currentMileage }: { vehicleId: string; currentMileage: number }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [intervalKm, setIntervalKm] = useState("")
  const [intervalMonths, setIntervalMonths] = useState("")
  const [lastMileage, setLastMileage] = useState("")
  const [lastDate, setLastDate] = useState("")
  const create = useCreateServiceInterval()

  const reset = () => {
    setName("")
    setIntervalKm("")
    setIntervalMonths("")
    setLastMileage("")
    setLastDate("")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      {
        name,
        vehicleId,
        intervalKm: intervalKm ? Number(intervalKm) : undefined,
        intervalMonths: intervalMonths ? Number(intervalMonths) : undefined,
        lastServiceMileage: lastMileage ? Number(lastMileage) : currentMileage,
        lastServiceDate: lastDate || new Date().toISOString().slice(0, 10),
      },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-3 w-3" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый интервал обслуживания</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Замена масла" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Интервал (км)</Label>
              <Input type="number" min={1} value={intervalKm} onChange={(e) => setIntervalKm(e.target.value)} placeholder="10000" />
            </div>
            <div className="space-y-2">
              <Label>Интервал (мес.)</Label>
              <Input type="number" min={1} value={intervalMonths} onChange={(e) => setIntervalMonths(e.target.value)} placeholder="6" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Посл. пробег</Label>
              <Input type="number" min={0} value={lastMileage} onChange={(e) => setLastMileage(e.target.value)} placeholder={String(currentMileage)} />
            </div>
            <div className="space-y-2">
              <Label>Посл. дата</Label>
              <Input type="date" value={lastDate} onChange={(e) => setLastDate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Создание..." : "Создать"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
