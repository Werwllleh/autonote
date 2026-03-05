import { useState, type FormEvent } from "react"
import { useCreateExpense } from "@/hooks/use-expenses"
import { useCategories } from "@/hooks/use-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export function AddExpenseDialog({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [mileage, setMileage] = useState("")

  const { data: categories = [] } = useCategories()
  const create = useCreateExpense()

  const reset = () => {
    setAmount("")
    setDate(new Date().toISOString().slice(0, 10))
    setCategoryId("")
    setDescription("")
    setMileage("")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate(
      {
        amount: Number(amount),
        date,
        categoryId,
        vehicleId,
        description: description || undefined,
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
          Добавить расход
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый расход</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Сумма (руб.)</Label>
              <Input required type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="3500" />
            </div>
            <div className="space-y-2">
              <Label>Дата</Label>
              <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Категория</Label>
            <Select required value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="АИ-95, полный бак" />
          </div>
          <div className="space-y-2">
            <Label>Пробег (км)</Label>
            <Input type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="Текущий пробег" />
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending || !categoryId}>
            {create.isPending ? "Создание..." : "Добавить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
