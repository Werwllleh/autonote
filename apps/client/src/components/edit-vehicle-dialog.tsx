import { useState, useEffect, type FormEvent } from "react"
import { useUpdateVehicle } from "@/hooks/use-vehicles"
import { useQueryClient } from "@tanstack/react-query"
import type { Vehicle } from "@/api/vehicles"
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
import { Pencil } from "lucide-react"

interface Props {
  vehicle: Vehicle
}

export function EditVehicleDialog({ vehicle }: Props) {
  const [open, setOpen] = useState(false)
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [mileage, setMileage] = useState("")
  const [vin, setVin] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [notes, setNotes] = useState("")

  const update = useUpdateVehicle()
  const qc = useQueryClient()

  useEffect(() => {
    if (open) {
      setBrand(vehicle.brand)
      setModel(vehicle.model)
      setYear(String(vehicle.year))
      setMileage(String(vehicle.mileage))
      setVin(vehicle.vin || "")
      setLicensePlate(vehicle.licensePlate || "")
      setRegistrationNumber(vehicle.registrationNumber || "")
      setPurchaseDate(vehicle.purchaseDate?.slice(0, 10) || "")
      setPurchasePrice(vehicle.purchasePrice ? String(vehicle.purchasePrice) : "")
      setNotes(vehicle.notes || "")
    }
  }, [open, vehicle])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    update.mutate(
      {
        id: vehicle.id,
        brand,
        model,
        year: Number(year),
        mileage: Number(mileage),
        vin: vin || null,
        licensePlate: licensePlate || null,
        registrationNumber: registrationNumber || null,
        purchaseDate: purchaseDate || null,
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          setOpen(false)
          qc.invalidateQueries({ queryKey: ["vehicles", vehicle.id] })
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать автомобиль</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={update.isPending} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Марка</Label>
                <Input required value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Модель</Label>
                <Input required value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Год</Label>
                <Input required type="number" min={1900} max={2100} value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Пробег (км)</Label>
                <Input required type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Дополнительно</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>VIN</Label>
                  <Input value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="XTA..." maxLength={17} className="uppercase" />
                </div>
                <div className="space-y-2">
                  <Label>Госномер</Label>
                  <Input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value.toUpperCase())} placeholder="А000АА 777" className="uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>СТС / ПТС</Label>
                  <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="99 АА 123456" />
                </div>
                <div className="space-y-2">
                  <Label>Дата покупки</Label>
                  <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Цена покупки (руб.)</Label>
                <Input type="number" min={0} value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Заметки</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Любая дополнительная информация" />
              </div>
            </div>
          </fieldset>
          <Button type="submit" className="w-full" disabled={update.isPending}>
            {update.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
