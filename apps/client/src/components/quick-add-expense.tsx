import { useState } from "react"
import type { Vehicle } from "@/api/vehicles"
import { ExpenseDialog } from "@/components/expense-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Car } from "lucide-react"

interface Props {
  vehicles: Vehicle[]
}

export function QuickAddExpense({ vehicles }: Props) {
  const [selectedId, setSelectedId] = useState<string>(vehicles[0]?.id ?? "")
  const [pickerOpen, setPickerOpen] = useState(false)

  // Single vehicle — just render ExpenseDialog
  if (vehicles.length === 1) {
    return (
      <ExpenseDialog
        vehicleId={vehicles[0].id}
        trigger={
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Расход</span>
          </Button>
        }
      />
    )
  }

  // Multiple vehicles — picker dialog, then redirect to selected vehicle for adding
  const selected = vehicles.find((v) => v.id === selectedId)

  return (
    <div className="flex items-center gap-1">
      {/* Vehicle picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 max-w-[140px]">
            <Car className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-xs">
              {selected ? `${selected.brand} ${selected.model}` : "Авто"}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Выберите автомобиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {vehicles.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                  v.id === selectedId
                    ? "border-slate-950 dark:border-white bg-slate-50 dark:bg-slate-800 font-semibold"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
                onClick={() => {
                  setSelectedId(v.id)
                  setPickerOpen(false)
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {v.photo ? (
                    <img src={`/api${v.photo}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Car className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{v.brand} {v.model}</p>
                  <p className="text-xs text-muted-foreground">{v.year}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add expense for selected vehicle */}
      <ExpenseDialog
        vehicleId={selectedId}
        trigger={
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Расход</span>
          </Button>
        }
      />
    </div>
  )
}
