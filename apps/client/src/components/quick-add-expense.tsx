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
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent ${v.id === selectedId ? "border-primary bg-accent/50" : ""}`}
                onClick={() => {
                  setSelectedId(v.id)
                  setPickerOpen(false)
                }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                  {v.photo ? (
                    <img src={`/api${v.photo}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Car className="h-4 w-4 text-muted-foreground" />
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
