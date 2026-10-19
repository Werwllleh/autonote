import { useState, type FormEvent } from "react"
import {
  Disc,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  Sun,
  Snowflake,
  Compass,
  ArrowRightLeft,
  Warehouse,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useTires,
  useCreateTire,
  useUpdateTire,
  useDeleteTire,
  useMountTire,
} from "@/hooks/use-tires"
import type { TireSet, TireSeason } from "@/api/tires"

interface TiresManagerProps {
  vehicleId: string
  currentMileage: number
}

function getSeasonBadge(season: TireSeason) {
  switch (season) {
    case "summer":
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs">
          <Sun className="h-3 w-3" />
          <span>Лето</span>
        </Badge>
      )
    case "winter_stud":
      return (
        <Badge variant="secondary" className="gap-1 bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 text-xs">
          <Snowflake className="h-3 w-3" />
          <span>Зима (шипы)</span>
        </Badge>
      )
    case "winter_friction":
      return (
        <Badge variant="secondary" className="gap-1 bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs">
          <Snowflake className="h-3 w-3" />
          <span>Зима (липучка)</span>
        </Badge>
      )
    case "all_season":
      return (
        <Badge variant="secondary" className="gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
          <Compass className="h-3 w-3" />
          <span>Всесезонка</span>
        </Badge>
      )
  }
}

export function TiresManager({ vehicleId, currentMileage }: TiresManagerProps) {
  const [open, setOpen] = useState(false)
  const { data: tireSets = [], isLoading } = useTires(vehicleId)
  const [editingTire, setEditingTire] = useState<TireSet | null>(null)
  const [mountingTire, setMountingTire] = useState<TireSet | null>(null)

  const mountedSet = tireSets.find((t) => t.isMounted)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
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
          <Disc className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Шины и колёса</h2>
          {tireSets.length > 0 && <Badge variant="secondary">{tireSets.length}</Badge>}
          {mountedSet && !open && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>{mountedSet.name}</span>
            </span>
          )}
        </button>

        <AddTireDialog vehicleId={vehicleId} currentMileage={currentMileage} />
      </div>

      {open && (
        <div className="space-y-3 pt-1">
          {isLoading && (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Загрузка шин и колёс...
            </p>
          )}

          {!isLoading && tireSets.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground space-y-2">
              <Disc className="h-8 w-8 mx-auto opacity-40 text-muted-foreground" />
              <p>У вас пока нет добавленных комплектов шин.</p>
              <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                Добавьте летний и зимний комплекты резины, чтобы отслеживать их пробег, износ
                протектора и быстро фиксировать сезонную смену с записью шиномонтажа.
              </p>
            </div>
          )}

          {tireSets.map((tire) => {
            const isCurrentlyMounted = tire.isMounted
            const seasonDriven =
              isCurrentlyMounted && tire.installedMileage !== null && currentMileage >= tire.installedMileage
                ? currentMileage - tire.installedMileage
                : 0
            const totalDriven = tire.totalMileage + seasonDriven

            return (
              <div
                key={tire.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 transition-all ${
                  isCurrentlyMounted
                    ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-transparent shadow-sm"
                    : "border-border/60 bg-card/60"
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{tire.name}</span>
                    {getSeasonBadge(tire.season)}
                    {isCurrentlyMounted ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-semibold gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        На автомобиле
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        На хранении
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {tire.size && (
                      <span className="font-mono">{tire.size}</span>
                    )}
                    {tire.productionYear && (
                      <span>{tire.productionYear} г.в.</span>
                    )}
                    {tire.treadDepth !== null && (
                      <span
                        className={
                          tire.treadDepth < 3
                            ? "text-destructive font-medium"
                            : tire.treadDepth < 4.5
                            ? "text-amber-500 font-medium"
                            : ""
                        }
                      >
                        Остаток: {tire.treadDepth} мм
                      </span>
                    )}
                    {!isCurrentlyMounted && tire.storageLocation && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Warehouse className="h-3 w-3" />
                        {tire.storageLocation}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground pt-0.5">
                    {isCurrentlyMounted ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        В этом сезоне: +{seasonDriven.toLocaleString("ru-RU")} км • Всего: {totalDriven.toLocaleString("ru-RU")} км
                      </span>
                    ) : (
                      <span>Общий пробег комплекта: {totalDriven.toLocaleString("ru-RU")} км</span>
                    )}
                    {tire.notes && (
                      <p className="text-[11px] text-muted-foreground/80 italic mt-0.5">{tire.notes}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  {!isCurrentlyMounted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setMountingTire(tire)}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      <span>Установить</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    title="Редактировать"
                    onClick={() => setEditingTire(tire)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <DeleteTireButton tireId={tire.id} vehicleId={vehicleId} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mount Tire Modal */}
      {mountingTire && (
        <MountTireDialog
          vehicleId={vehicleId}
          tire={mountingTire}
          currentMileage={currentMileage}
          onClose={() => setMountingTire(null)}
        />
      )}

      {/* Edit Tire Modal */}
      {editingTire && (
        <EditTireDialog
          vehicleId={vehicleId}
          tire={editingTire}
          onClose={() => setEditingTire(null)}
        />
      )}
    </div>
  )
}

function DeleteTireButton({ tireId, vehicleId }: { tireId: string; vehicleId: string }) {
  const deleteMutation = useDeleteTire(vehicleId)

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      title="Удалить комплект"
      disabled={deleteMutation.isPending}
      onClick={() => {
        if (confirm("Удалить этот комплект шин?")) {
          deleteMutation.mutate(tireId)
        }
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}

function AddTireDialog({ vehicleId, currentMileage }: { vehicleId: string; currentMileage: number }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [season, setSeason] = useState<TireSeason>("summer")
  const [size, setSize] = useState("")
  const [productionYear, setProductionYear] = useState("")
  const [treadDepth, setTreadDepth] = useState("")
  const [storageLocation, setStorageLocation] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [totalMileage, setTotalMileage] = useState("")
  const [notes, setNotes] = useState("")

  const createMutation = useCreateTire(vehicleId)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    createMutation.mutate(
      {
        vehicleId,
        name: name.trim(),
        season,
        size: size.trim() || undefined,
        productionYear: productionYear ? parseInt(productionYear, 10) : undefined,
        treadDepth: treadDepth ? parseFloat(treadDepth) : undefined,
        storageLocation: storageLocation.trim() || undefined,
        isMounted,
        installedMileage: isMounted ? currentMileage : undefined,
        totalMileage: totalMileage ? parseInt(totalMileage, 10) : 0,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setName("")
          setSize("")
          setProductionYear("")
          setTreadDepth("")
          setStorageLocation("")
          setIsMounted(false)
          setTotalMileage("")
          setNotes("")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          <span>Добавить комплект</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавление комплекта шин / колёс</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="tire-name">Название / Модель *</Label>
            <Input
              id="tire-name"
              placeholder="например: Michelin Pilot Sport 4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tire-season">Сезонность</Label>
              <Select value={season} onValueChange={(v) => setSeason(v as TireSeason)}>
                <SelectTrigger id="tire-season">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summer">☀️ Лето</SelectItem>
                  <SelectItem value="winter_stud">❄️ Зима (шипы)</SelectItem>
                  <SelectItem value="winter_friction">❄️ Зима (липучка)</SelectItem>
                  <SelectItem value="all_season">🌤️ Всесезонка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tire-size">Размерность</Label>
              <Input
                id="tire-size"
                placeholder="225/45 R17"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tire-depth">Остаток протектора (мм)</Label>
              <Input
                id="tire-depth"
                type="number"
                step="0.1"
                placeholder="7.5"
                value={treadDepth}
                onChange={(e) => setTreadDepth(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tire-year">Год выпуска (DOT)</Label>
              <Input
                id="tire-year"
                type="number"
                placeholder="2023"
                value={productionYear}
                onChange={(e) => setProductionYear(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tire-storage">Место хранения (когда сняты)</Label>
            <Input
              id="tire-storage"
              placeholder="Гараж, Шинный отель, Балкон..."
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tire-prev-mileage">Предыдущий суммарный пробег (км)</Label>
            <Input
              id="tire-prev-mileage"
              type="number"
              placeholder="0"
              value={totalMileage}
              onChange={(e) => setTotalMileage(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="tire-mounted"
              checked={isMounted}
              onChange={(e) => setIsMounted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="tire-mounted" className="text-xs cursor-pointer font-normal">
              Этот комплект установлен на автомобиль прямо сейчас
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditTireDialog({
  vehicleId,
  tire,
  onClose,
}: {
  vehicleId: string
  tire: TireSet
  onClose: () => void
}) {
  const [name, setName] = useState(tire.name)
  const [season, setSeason] = useState<TireSeason>(tire.season)
  const [size, setSize] = useState(tire.size || "")
  const [productionYear, setProductionYear] = useState(tire.productionYear ? String(tire.productionYear) : "")
  const [treadDepth, setTreadDepth] = useState(tire.treadDepth !== null ? String(tire.treadDepth) : "")
  const [storageLocation, setStorageLocation] = useState(tire.storageLocation || "")
  const [totalMileage, setTotalMileage] = useState(String(tire.totalMileage))
  const [notes, setNotes] = useState(tire.notes || "")

  const updateMutation = useUpdateTire(vehicleId)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    updateMutation.mutate(
      {
        id: tire.id,
        data: {
          name: name.trim(),
          season,
          size: size.trim() || undefined,
          productionYear: productionYear ? parseInt(productionYear, 10) : undefined,
          treadDepth: treadDepth ? parseFloat(treadDepth) : undefined,
          storageLocation: storageLocation.trim() || undefined,
          totalMileage: totalMileage ? parseInt(totalMileage, 10) : 0,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: onClose,
      }
    )
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактирование комплекта шин</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-tire-name">Название / Модель *</Label>
            <Input
              id="edit-tire-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-tire-season">Сезонность</Label>
              <Select value={season} onValueChange={(v) => setSeason(v as TireSeason)}>
                <SelectTrigger id="edit-tire-season">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summer">☀️ Лето</SelectItem>
                  <SelectItem value="winter_stud">❄️ Зима (шипы)</SelectItem>
                  <SelectItem value="winter_friction">❄️ Зима (липучка)</SelectItem>
                  <SelectItem value="all_season">🌤️ Всесезонка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-tire-size">Размерность</Label>
              <Input
                id="edit-tire-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-tire-depth">Остаток протектора (мм)</Label>
              <Input
                id="edit-tire-depth"
                type="number"
                step="0.1"
                value={treadDepth}
                onChange={(e) => setTreadDepth(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-tire-year">Год выпуска</Label>
              <Input
                id="edit-tire-year"
                type="number"
                value={productionYear}
                onChange={(e) => setProductionYear(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tire-storage">Место хранения</Label>
            <Input
              id="edit-tire-storage"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tire-mileage">Суммарный пробег (км)</Label>
            <Input
              id="edit-tire-mileage"
              type="number"
              value={totalMileage}
              onChange={(e) => setTotalMileage(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tire-notes">Заметки</Label>
            <Input
              id="edit-tire-notes"
              placeholder="Давление, состояние дисков, нюансы..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !name.trim()}>
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MountTireDialog({
  vehicleId,
  tire,
  currentMileage,
  onClose,
}: {
  vehicleId: string
  tire: TireSet
  currentMileage: number
  onClose: () => void
}) {
  const [mileage, setMileage] = useState(String(currentMileage))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [treadDepth, setTreadDepth] = useState(tire.treadDepth !== null ? String(tire.treadDepth) : "")
  const [createExpense, setCreateExpense] = useState(true)
  const [expenseAmount, setExpenseAmount] = useState("2500")

  const mountMutation = useMountTire(vehicleId)

  const handleMount = (e: FormEvent) => {
    e.preventDefault()
    const mil = parseInt(mileage, 10)
    if (isNaN(mil) || mil < 0) return

    mountMutation.mutate(
      {
        id: tire.id,
        data: {
          mileage: mil,
          date,
          treadDepth: treadDepth ? parseFloat(treadDepth) : undefined,
          createExpense,
          expenseAmount: createExpense && expenseAmount ? parseFloat(expenseAmount) : undefined,
        },
      },
      {
        onSuccess: onClose,
      }
    )
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Сезонная смена шин (переобувка)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleMount} className="space-y-4 pt-2">
          <div className="rounded-lg bg-muted/60 p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground">Устанавливаемый комплект:</p>
            <p className="text-muted-foreground">
              {tire.name} • {tire.size || "Размер не указан"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mount-mileage">Текущий пробег (км) *</Label>
              <Input
                id="mount-mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mount-date">Дата смены</Label>
              <Input
                id="mount-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mount-depth">Остаток протектора (мм, если измерили)</Label>
            <Input
              id="mount-depth"
              type="number"
              step="0.1"
              placeholder="7.2"
              value={treadDepth}
              onChange={(e) => setTreadDepth(e.target.value)}
            />
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mount-expense"
                checked={createExpense}
                onChange={(e) => setCreateExpense(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="mount-expense" className="text-xs cursor-pointer font-medium">
                Записать расход на шиномонтаж в историю
              </Label>
            </div>

            {createExpense && (
              <div className="pt-1">
                <Label htmlFor="mount-cost" className="text-xs text-muted-foreground">
                  Стоимость шиномонтажа (₽)
                </Label>
                <Input
                  id="mount-cost"
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={mountMutation.isPending || !mileage}>
              Установить комплект
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
