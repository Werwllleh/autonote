import { useState, useMemo, useEffect, type FormEvent, type ReactNode } from "react"
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-expenses"
import { useCategories } from "@/hooks/use-categories"
import type { Expense } from "@/api/expenses"
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

interface ExpenseDialogProps {
  vehicleId: string
  expense?: Expense
  trigger?: ReactNode
}

export function ExpenseDialog({ vehicleId, expense, trigger }: ExpenseDialogProps) {
  const isEdit = !!expense
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [mileage, setMileage] = useState("")
  const [liters, setLiters] = useState("")
  const [pricePerLiter, setPricePerLiter] = useState("")
  const [bonuses, setBonuses] = useState("")

  const { data: categories = [] } = useCategories()
  const create = useCreateExpense()
  const update = useUpdateExpense()
  const mutation = isEdit ? update : create

  useEffect(() => {
    if (open && expense) {
      setAmount(String(expense.amount))
      setDate(expense.date.slice(0, 10))
      setCategoryId(expense.categoryId)
      setDescription(expense.description || "")
      setMileage(expense.mileage ? String(expense.mileage) : "")
      setLiters(expense.liters ? String(expense.liters) : "")
      setPricePerLiter(expense.pricePerLiter ? String(expense.pricePerLiter) : "")
      setBonuses(expense.bonuses ? String(expense.bonuses) : "")
    }
    if (open && !expense) {
      reset()
    }
  }, [open, expense])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  )
  const isFuel = selectedCategory?.slug === "fuel"

  const fuelTotal = useMemo(() => {
    const l = parseFloat(liters)
    const p = parseFloat(pricePerLiter)
    if (!isNaN(l) && !isNaN(p) && l > 0 && p > 0) return l * p
    return 0
  }, [liters, pricePerLiter])

  const fuelFinal = useMemo(() => {
    if (fuelTotal <= 0) return 0
    const b = parseFloat(bonuses)
    if (!isNaN(b) && b > 0) return Math.max(0, fuelTotal - b)
    return fuelTotal
  }, [fuelTotal, bonuses])

  const reset = () => {
    setAmount("")
    setDate(new Date().toISOString().slice(0, 10))
    setCategoryId("")
    setDescription("")
    setMileage("")
    setLiters("")
    setPricePerLiter("")
    setBonuses("")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const finalAmount = isFuel ? fuelFinal : Number(amount)

    const onSuccess = () => {
      setOpen(false)
      if (!isEdit) reset()
    }

    const base = {
      amount: finalAmount,
      date,
      categoryId,
      vehicleId,
      description: description || undefined,
      mileage: mileage ? Number(mileage) : undefined,
    }

    if (isEdit) {
      update.mutate(
        {
          id: expense.id,
          ...base,
          liters: isFuel ? parseFloat(liters) : null,
          pricePerLiter: isFuel ? parseFloat(pricePerLiter) : null,
          bonuses: isFuel && bonuses ? parseFloat(bonuses) : null,
        },
        { onSuccess },
      )
    } else {
      create.mutate(
        {
          ...base,
          ...(isFuel && {
            liters: parseFloat(liters),
            pricePerLiter: parseFloat(pricePerLiter),
            bonuses: bonuses ? parseFloat(bonuses) : undefined,
          }),
        },
        { onSuccess },
      )
    }
  }

  const isPending = mutation.isPending
  const canSubmit = isFuel
    ? !!categoryId && fuelTotal > 0
    : !!categoryId && Number(amount) > 0

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="mr-1 sm:mr-2 h-4 w-4" />
      <span className="hidden sm:inline">Добавить расход</span>
      <span className="sm:hidden">Расход</span>
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать расход" : "Новый расход"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isPending} className="space-y-4">
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

            {isFuel ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Количество литров</Label>
                    <Input
                      required
                      type="number"
                      min={0}
                      step="0.01"
                      value={liters}
                      onChange={(e) => setLiters(e.target.value)}
                      placeholder="40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Цена за 1 литр</Label>
                    <Input
                      required
                      type="number"
                      min={0}
                      step="0.01"
                      value={pricePerLiter}
                      onChange={(e) => setPricePerLiter(e.target.value)}
                      placeholder="54.50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Оплачено бонусами (руб.)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={bonuses}
                    onChange={(e) => setBonuses(e.target.value)}
                    placeholder="0"
                  />
                </div>
                {fuelTotal > 0 && (
                  <div className="rounded-md bg-muted px-3 py-2 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Полная стоимость:</span>
                      <span>{fuelTotal.toFixed(2)} руб.</span>
                    </div>
                    {bonuses && parseFloat(bonuses) > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Бонусы:</span>
                          <span>−{parseFloat(bonuses).toFixed(2)} руб.</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Итого:</span>
                          <span>{fuelFinal.toFixed(2)} руб.</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Сумма (руб.)</Label>
                  <Input
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="3500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата</Label>
                  <Input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {isFuel && (
              <div className="space-y-2">
                <Label>Дата</Label>
                <Input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isFuel ? "АИ-95, Лукойл" : "Описание расхода"}
              />
            </div>
            <div className="space-y-2">
              <Label>Пробег (км)</Label>
              <Input
                type="number"
                min={0}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Текущий пробег"
              />
            </div>
          </fieldset>
          <Button type="submit" className="w-full" disabled={isPending || !canSubmit}>
            {isPending
              ? isEdit
                ? "Сохранение..."
                : "Создание..."
              : isEdit
                ? "Сохранить"
                : "Добавить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
