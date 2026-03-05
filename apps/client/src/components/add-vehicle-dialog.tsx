import { useState, type FormEvent } from "react"
import { useCreateVehicle } from "@/hooks/use-vehicles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false)
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [mileage, setMileage] = useState("")
  const create = useCreateVehicle()

  const reset = () => {
    setBrand("")
    setModel("")
    setYear("")
    setMileage("")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      {
        brand,
        model,
        year: Number(year),
        mileage: mileage ? Number(mileage) : undefined,
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Добавить авто
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый автомобиль</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Марка</Label>
              <Input required value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Toyota" />
            </div>
            <div className="space-y-2">
              <Label>Модель</Label>
              <Input required value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Год</Label>
              <Input required type="number" min={1900} max={2100} value={year} onChange={(e) => setYear(e.target.value)} placeholder="2023" />
            </div>
            <div className="space-y-2">
              <Label>Пробег (км)</Label>
              <Input type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="0" />
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
