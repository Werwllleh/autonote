import { useState, useMemo, useEffect, type FormEvent, type ReactNode } from "react"
import { useCreateExpense, useUpdateExpense } from "@/hooks/use-expenses"
import { useCategories } from "@/hooks/use-categories"
import { useParts } from "@/hooks/use-parts"
import { useQueryClient } from "@tanstack/react-query"
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
import { Plus, Trash2, Package } from "lucide-react"

interface PartRow {
  article: string
  name: string
  quantity: string
  price: string
}

const emptyPart = (): PartRow => ({ article: "", name: "", quantity: "1", price: "" })

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
  // Fuel
  const [liters, setLiters] = useState("")
  const [pricePerLiter, setPricePerLiter] = useState("")
  const [bonuses, setBonuses] = useState("")
  // Maintenance
  const [parts, setParts] = useState<PartRow[]>([])
  const [laborCost, setLaborCost] = useState("")
  // Stock parts (picked from inventory)
  const [stockItems, setStockItems] = useState<{ partId: string; quantity: number }[]>([])

  const { data: categories = [] } = useCategories()
  const { data: stockParts = [] } = useParts(vehicleId)
  const qc = useQueryClient()
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
      setParts(
        expense.parts?.length
          ? expense.parts.map((p) => ({
              article: p.article || "",
              name: p.name,
              quantity: String(p.quantity),
              price: String(p.price),
            }))
          : [],
      )
      setLaborCost(expense.laborCost ? String(expense.laborCost) : "")
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
  const isMaintenance = selectedCategory?.slug === "maintenance"

  // Fuel calculations
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

  // Maintenance calculations
  const partsTotal = useMemo(() => {
    return parts.reduce((sum, p) => {
      const q = parseFloat(p.quantity)
      const pr = parseFloat(p.price)
      if (!isNaN(q) && !isNaN(pr) && q > 0 && pr > 0) return sum + q * pr
      return sum
    }, 0)
  }, [parts])

  const stockPartsTotal = useMemo(() => {
    return stockItems.reduce((sum, item) => {
      const sp = stockParts.find((p) => p.id === item.partId)
      return sp ? sum + sp.price * item.quantity : sum
    }, 0)
  }, [stockItems, stockParts])

  const laborCostNum = useMemo(() => {
    const v = parseFloat(laborCost)
    return !isNaN(v) && v > 0 ? v : 0
  }, [laborCost])

  const maintenanceTotal = partsTotal + stockPartsTotal + laborCostNum
  const hasParts = parts.some((p) => p.name && parseFloat(p.price) > 0)
  const hasStockParts = stockItems.length > 0

  // Stock parts helpers
  const availableStockParts = useMemo(
    () => stockParts.filter((p) => p.quantity > 0),
    [stockParts],
  )

  const addStockPart = (partId: string) => {
    if (stockItems.some((s) => s.partId === partId)) return
    setStockItems([...stockItems, { partId, quantity: 1 }])
  }

  const removeStockPart = (partId: string) => {
    setStockItems(stockItems.filter((s) => s.partId !== partId))
  }

  const updateStockPartQty = (partId: string, qty: number) => {
    setStockItems(stockItems.map((s) => (s.partId === partId ? { ...s, quantity: qty } : s)))
  }

  // Parts management
  const addPart = () => setParts([...parts, emptyPart()])
  const removePart = (i: number) => setParts(parts.filter((_, idx) => idx !== i))
  const updatePart = (i: number, field: keyof PartRow, value: string) => {
    setParts(parts.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))
  }

  const reset = () => {
    setAmount("")
    setDate(new Date().toISOString().slice(0, 10))
    setCategoryId("")
    setDescription("")
    setMileage("")
    setLiters("")
    setPricePerLiter("")
    setBonuses("")
    setParts([])
    setLaborCost("")
    setStockItems([])
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    let finalAmount: number
    if (isFuel) {
      finalAmount = fuelFinal
    } else if (isMaintenance && (hasParts || laborCostNum > 0)) {
      finalAmount = maintenanceTotal
    } else {
      finalAmount = Number(amount)
    }

    const onSuccess = () => {
      setOpen(false)
      if (!isEdit) reset()
      // Refresh stock after using parts
      if (stockItems.length > 0) {
        qc.invalidateQueries({ queryKey: ["parts", vehicleId] })
      }
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
          parts: isMaintenance && hasParts
            ? parts
                .filter((p) => p.name && parseFloat(p.price) > 0)
                .map((p) => ({
                  article: p.article || undefined,
                  name: p.name,
                  quantity: Number(p.quantity) || 1,
                  price: Number(p.price),
                }))
            : null,
          laborCost: isMaintenance && laborCostNum > 0 ? laborCostNum : null,
        },
        { onSuccess },
      )
    } else {
      // Combine manual parts + stock parts into single parts array
      const manualParts = hasParts
        ? parts
            .filter((p) => p.name && parseFloat(p.price) > 0)
            .map((p) => ({
              article: p.article || undefined,
              name: p.name,
              quantity: Number(p.quantity) || 1,
              price: Number(p.price),
            }))
        : []

      const stockPartsMapped = stockItems.map((item) => {
        const sp = stockParts.find((p) => p.id === item.partId)!
        return {
          article: sp.article || undefined,
          name: sp.name,
          quantity: item.quantity,
          price: sp.price,
        }
      })

      const allParts = [...manualParts, ...stockPartsMapped]

      create.mutate(
        {
          ...base,
          ...(isFuel && {
            liters: parseFloat(liters),
            pricePerLiter: parseFloat(pricePerLiter),
            bonuses: bonuses ? parseFloat(bonuses) : undefined,
          }),
          ...(isMaintenance && {
            ...(allParts.length > 0 && { parts: allParts }),
            ...(laborCostNum > 0 && { laborCost: laborCostNum }),
            ...(stockItems.length > 0 && { stockParts: stockItems }),
          }),
        },
        { onSuccess },
      )
    }
  }

  const isPending = mutation.isPending

  let canSubmit = !!categoryId
  if (isFuel) {
    canSubmit = canSubmit && fuelTotal > 0
  } else if (isMaintenance) {
    canSubmit = canSubmit && (maintenanceTotal > 0 || Number(amount) > 0)
  } else {
    canSubmit = canSubmit && Number(amount) > 0
  }

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="mr-1 sm:mr-2 h-4 w-4" />
      <span className="hidden sm:inline">Добавить расход</span>
      <span className="sm:hidden">Расход</span>
    </Button>
  )

  // Should show manual amount field for maintenance?
  const showManualAmount = isMaintenance && !hasParts && !hasStockParts && laborCostNum === 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
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

            {/* === FUEL === */}
            {isFuel && (
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
            )}

            {/* === MAINTENANCE === */}
            {isMaintenance && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Запчасти</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPart}>
                      <Plus className="mr-1 h-3 w-3" />
                      Добавить
                    </Button>
                  </div>
                  {parts.map((part, i) => (
                    <div key={i} className="space-y-2 rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Запчасть {i + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removePart(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Артикул"
                          value={part.article}
                          onChange={(e) => updatePart(i, "article", e.target.value.toUpperCase())}
                          className="uppercase"
                        />
                        <Input
                          required
                          placeholder="Название"
                          value={part.name}
                          onChange={(e) => updatePart(i, "name", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Кол-во</span>
                          <Input
                            required
                            type="number"
                            min={1}
                            value={part.quantity}
                            onChange={(e) => updatePart(i, "quantity", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">Цена за шт.</span>
                          <Input
                            required
                            type="number"
                            min={0}
                            step="0.01"
                            value={part.price}
                            onChange={(e) => updatePart(i, "price", e.target.value)}
                          />
                        </div>
                      </div>
                      {(Number(part.quantity) || 0) > 0 && (Number(part.price) || 0) > 0 && (
                        <div className="text-xs text-right text-muted-foreground">
                          Сумма: <span className="font-medium text-foreground">{((Number(part.quantity) || 0) * (Number(part.price) || 0)).toFixed(2)} руб.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Stock parts picker */}
                {availableStockParts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        Со склада
                      </Label>
                      <Select
                        value=""
                        onValueChange={(id) => addStockPart(id)}
                      >
                        <SelectTrigger className="w-auto h-8 text-xs gap-1">
                          <Plus className="h-3 w-3" />
                          <SelectValue placeholder="Выбрать" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStockParts
                            .filter((p) => !stockItems.some((s) => s.partId === p.id))
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.quantity} шт.)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {stockItems.map((item) => {
                      const sp = stockParts.find((p) => p.id === item.partId)
                      if (!sp) return null
                      return (
                        <div key={item.partId} className="rounded-md border border-dashed px-3 py-2 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{sp.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {sp.article && `${sp.article} · `}{sp.price.toFixed(2)} руб./шт.
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => removeStockPart(item.partId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              max={sp.quantity}
                              value={item.quantity}
                              onChange={(e) =>
                                updateStockPartQty(item.partId, Math.min(Number(e.target.value) || 1, sp.quantity))
                              }
                              className="w-16 h-8 text-center"
                            />
                            <span className="text-xs text-muted-foreground">шт.</span>
                            <span className="ml-auto text-sm font-medium">
                              {(sp.price * item.quantity).toFixed(2)} руб.
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Стоимость работы (руб.)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    placeholder="0"
                  />
                </div>
                {maintenanceTotal > 0 && (
                  <div className="rounded-md bg-muted px-3 py-2 text-sm space-y-1">
                    {partsTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Запчасти (ручные):</span>
                        <span>{partsTotal.toFixed(2)} руб.</span>
                      </div>
                    )}
                    {stockPartsTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Запчасти (со склада):</span>
                        <span>{stockPartsTotal.toFixed(2)} руб.</span>
                      </div>
                    )}
                    {laborCostNum > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Работа:</span>
                        <span>{laborCostNum.toFixed(2)} руб.</span>
                      </div>
                    )}
                    {(partsTotal + stockPartsTotal > 0 && laborCostNum > 0) || (partsTotal > 0 && stockPartsTotal > 0) ? (
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Итого:</span>
                        <span>{maintenanceTotal.toFixed(2)} руб.</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {/* === DEFAULT / MANUAL AMOUNT === */}
            {!isFuel && !isMaintenance && (
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

            {showManualAmount && (
              <div className="space-y-2">
                <Label>Сумма вручную (руб.)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Если запчасти не указаны"
                />
              </div>
            )}

            {/* Date for fuel/maintenance */}
            {(isFuel || isMaintenance) && (
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
                placeholder={
                  isFuel
                    ? "АИ-95, Лукойл"
                    : isMaintenance
                      ? "Замена масла, фильтров"
                      : "Описание расхода"
                }
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
