import { useState, useMemo, type FormEvent } from "react"
import { useCategories } from "@/hooks/use-categories"
import { useCreateExpense } from "@/hooks/use-expenses"
import { useQueryClient } from "@tanstack/react-query"
import type { Part } from "@/api/parts"
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
import { Badge } from "@/components/ui/badge"
import { Wrench, User, Gauge, Check } from "lucide-react"

function formatAmount(amount: number) {
  return amount.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
}

interface InstallPartDialogProps {
  part: Part
  vehicleId: string
  currentMileage?: number
  trigger?: React.ReactNode
}

export function InstallPartDialog({
  part,
  vehicleId,
  currentMileage,
  trigger,
}: InstallPartDialogProps) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(String(part.quantity > 0 ? part.quantity : 1))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [mileage, setMileage] = useState(currentMileage ? String(currentMileage) : "")
  const [workType, setWorkType] = useState<"self" | "service">("self")
  const [laborCost, setLaborCost] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState(`Установка со склада: ${part.name}`)

  const { data: categories = [] } = useCategories()
  const createExpense = useCreateExpense()
  const qc = useQueryClient()

  // Find preferred default category
  const defaultCategoryId = useMemo(() => {
    if (!categories.length) return ""
    // If tire in name, prefer tire fitting
    if (/резина|шин|колес/i.test(part.name)) {
      const tireCat = categories.find((c) => /шин/i.test(c.slug) || /шин/i.test(c.name))
      if (tireCat) return tireCat.id
    }
    // Prefer "service", then "maintenance", then "repair"
    const serviceCat = categories.find((c) => c.slug === "service")
    if (serviceCat) return serviceCat.id
    const maintCat = categories.find((c) => c.slug === "maintenance")
    if (maintCat) return maintCat.id
    const repairCat = categories.find((c) => c.slug === "repair")
    if (repairCat) return repairCat.id
    return categories[0]?.id || ""
  }, [categories, part.name])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setQuantity(String(part.quantity > 0 ? part.quantity : 1))
      setDate(new Date().toISOString().slice(0, 10))
      setMileage(currentMileage ? String(currentMileage) : "")
      setWorkType("self")
      setLaborCost("")
      setCategoryId(defaultCategoryId)
      setDescription(`Установка со склада: ${part.name}`)
    }
  }

  const activeCategoryId = categoryId || defaultCategoryId
  const qtyNum = Math.max(1, Math.min(Number(quantity) || 1, part.quantity))
  const laborNum = workType === "service" ? (parseFloat(laborCost) || 0) : 0
  const partsTotal = qtyNum * part.price
  const totalExpense = partsTotal + laborNum

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!activeCategoryId) return

    createExpense.mutate(
      {
        vehicleId,
        categoryId: activeCategoryId,
        amount: totalExpense,
        date,
        mileage: mileage ? Number(mileage) : undefined,
        description: description.trim() || `Установка со склада: ${part.name}`,
        laborCost: laborNum > 0 ? laborNum : undefined,
        parts: [
          {
            article: part.article || undefined,
            name: part.name,
            quantity: qtyNum,
            price: part.price,
          },
        ],
        stockParts: [
          {
            partId: part.id,
            quantity: qtyNum,
          },
        ],
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["parts", vehicleId] })
          qc.invalidateQueries({ queryKey: ["expenses"] })
          qc.invalidateQueries({ queryKey: ["stats", vehicleId] })
          setOpen(false)
        },
      },
    )
  }

  const defaultBtn = (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs font-semibold px-2 gap-1 rounded-md text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
    >
      <Wrench className="h-3 w-3" />
      Установить
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultBtn}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md max-sm:!top-auto max-sm:!bottom-0 max-sm:!translate-y-0 max-sm:!translate-x-[-50%] max-sm:rounded-b-none max-sm:rounded-t-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Установка на автомобиль
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Списание детали со склада в бортовой журнал
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Part info badge */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
              {part.name}
            </span>
            <Badge variant="secondary" className="shrink-0 text-xs">
              В наличии: {part.quantity} шт.
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {part.article && (
              <span>
                Арт: <span className="font-mono font-medium text-foreground">{part.article}</span>
              </span>
            )}
            <span>Цена: {formatAmount(part.price)}/шт.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={createExpense.isPending} className="space-y-4">
            {/* Quantity and Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="install-qty" className="text-xs">
                  Списать (кол-во)
                </Label>
                <Input
                  id="install-qty"
                  type="number"
                  min={1}
                  max={part.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="install-date" className="text-xs">
                  Дата установки
                </Label>
                <div className="relative">
                  <Input
                    id="install-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mileage */}
            <div className="space-y-1.5">
              <Label htmlFor="install-mileage" className="text-xs flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                Пробег при установке (км)
              </Label>
              <Input
                id="install-mileage"
                type="number"
                min={0}
                placeholder="Например, 184400"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>

            {/* Installation Method Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs">Кто выполнял установку</Label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setWorkType("self")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    workType === "self"
                      ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Своими руками
                </button>
                <button
                  type="button"
                  onClick={() => setWorkType("service")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    workType === "service"
                      ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  В сервисе
                </button>
              </div>
            </div>

            {/* Service-specific inputs */}
            {workType === "service" && (
              <div className="space-y-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <div className="space-y-1.5">
                  <Label htmlFor="install-labor" className="text-xs">
                    Стоимость работы мастера (руб.)
                  </Label>
                  <Input
                    id="install-labor"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Например, 2500"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Категория расхода</Label>
                  <Select value={activeCategoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {workType === "self" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Категория для учета</Label>
                <Select value={activeCategoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-xs">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Работы бесплатны (0 ₽). Стоимость детали перейдет в указанную категорию.
                </p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="install-desc" className="text-xs">
                Заметка в бортовом журнале
              </Label>
              <Input
                id="install-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Заметка"
              />
            </div>

            {/* Calculation summary */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-3.5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Деталь ({qtyNum} шт. × {formatAmount(part.price)}):</span>
                <span>{formatAmount(partsTotal)}</span>
              </div>
              {workType === "service" && laborNum > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Работа мастера:</span>
                  <span>{formatAmount(laborNum)}</span>
                </div>
              )}
              {workType === "self" && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Работа:</span>
                  <span>0 ₽ (своими руками)</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                <span>Итого в расход:</span>
                <span>{formatAmount(totalExpense)}</span>
              </div>
            </div>
          </fieldset>

          <Button
            type="submit"
            className="w-full gap-1.5 font-semibold"
            disabled={createExpense.isPending || !activeCategoryId}
          >
            {createExpense.isPending ? (
              "Сохранение..."
            ) : (
              <>
                <Check className="h-4 w-4" />
                Списать и сохранить расход
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
