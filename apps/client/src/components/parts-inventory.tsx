import { useState, useMemo, type FormEvent } from "react"
import { useParts, useCreatePart, useUpdatePart, useDeletePart } from "@/hooks/use-parts"
import type { Part } from "@/api/parts"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Package, ChevronDown, ChevronRight, Search } from "lucide-react"

interface PartsInventoryProps {
  vehicleId: string
}

function PartFormDialog({
  vehicleId,
  part,
  allParts,
  trigger,
}: {
  vehicleId: string
  part?: Part
  allParts: Part[]
  trigger: React.ReactNode
}) {
  const isEdit = !!part
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [article, setArticle] = useState("")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")

  const create = useCreatePart()
  const update = useUpdatePart()

  // Check if article already exists on stock
  const existingMatch = useMemo(() => {
    if (isEdit || !article.trim()) return null
    const upper = article.trim()
    const match = allParts.find(
      (p) => p.article && p.article === upper,
    )
    return match || null
  }, [article, allParts, isEdit])

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && part) {
      setName(part.name)
      setArticle(part.article || "")
      setQuantity(String(part.quantity))
      setPrice(String(part.price))
    }
    if (isOpen && !part) {
      setName("")
      setArticle("")
      setQuantity("")
      setPrice("")
    }
  }

  const handleArticleChange = (value: string) => {
    const upper = value.toUpperCase()
    setArticle(upper)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const onSuccess = () => setOpen(false)

    const finalName = existingMatch ? existingMatch.name : name

    if (isEdit) {
      update.mutate(
        {
          id: part.id,
          vehicleId,
          name,
          article: article || undefined,
          quantity: Number(quantity),
          price: Number(price),
        },
        { onSuccess },
      )
    } else {
      create.mutate(
        {
          name: finalName,
          article: article || undefined,
          quantity: Number(quantity),
          price: Number(price),
          vehicleId,
        },
        { onSuccess },
      )
    }
  }

  const isPending = create.isPending || update.isPending

  const canSubmit = isEdit
    ? !!(name && quantity)
    : existingMatch
      ? !!(quantity && price)
      : !!(name && quantity && price)

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать запчасть" : "Добавить запчасть"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isPending} className="space-y-4">
            <div className="space-y-2">
              <Label>Артикул</Label>
              <Input
                value={article}
                onChange={(e) => handleArticleChange(e.target.value)}
                placeholder="OC 384"
                className="uppercase"
              />
              {!isEdit && existingMatch && (
                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Есть на складе: </span>
                  <span className="font-medium">{existingMatch.name}</span>
                  <span className="text-muted-foreground">
                    {" "}({existingMatch.quantity} шт.)
                  </span>
                </div>
              )}
            </div>
            {/* Hide name if article matches existing part */}
            {(isEdit || !existingMatch) && (
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  required={!existingMatch}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Масляный фильтр"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Количество</Label>
                <Input
                  required
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Цена за шт. (руб.)</Label>
                <Input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="450"
                />
              </div>
            </div>
          </fieldset>
          <Button type="submit" className="w-full" disabled={isPending || !canSubmit}>
            {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function formatAmount(amount: number) {
  return amount.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
}

interface PartGroup {
  article: string
  name: string
  items: Part[]
  totalQty: number
  totalValue: number
}

function PartGroupRow({
  group,
  vehicleId,
  allParts,
}: {
  group: PartGroup
  vehicleId: string
  allParts: Part[]
}) {
  const [expanded, setExpanded] = useState(false)
  const deletePart = useDeletePart()

  return (
    <div className="rounded-lg border overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{group.name}</span>
            <span className="text-xs text-muted-foreground">{group.article}</span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {group.items.length > 1
              ? `${group.items.length} позиций`
              : `${group.items[0].quantity} шт. × ${formatAmount(group.items[0].price)}`}
            <span className="font-medium text-foreground ml-2">
              = {formatAmount(group.totalValue)}
            </span>
          </div>
        </div>
        <Badge
          variant={group.totalQty > 0 ? "secondary" : "destructive"}
          className="text-xs shrink-0"
        >
          {group.totalQty} шт.
        </Badge>
      </button>

      {expanded && (
        <div className="border-t divide-y">
          {group.items.map((part) => (
            <div
              key={part.id}
              className="flex items-center gap-3 px-3 py-2 pl-10 bg-muted/20"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {part.quantity} шт. × {formatAmount(part.price)}
                  </span>
                  <span className="font-medium text-foreground">
                    = {formatAmount(part.quantity * part.price)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <PartFormDialog
                  vehicleId={vehicleId}
                  part={part}
                  allParts={allParts}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    if (confirm(`Удалить "${part.name}" (${formatAmount(part.price)}) со склада?`)) {
                      deletePart.mutate({ id: part.id, vehicleId })
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SinglePartRow({
  part,
  vehicleId,
  allParts,
}: {
  part: Part
  vehicleId: string
  allParts: Part[]
}) {
  const deletePart = useDeletePart()

  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{part.name}</span>
          {part.article && (
            <span className="text-xs text-muted-foreground">{part.article}</span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {part.quantity} шт. × {formatAmount(part.price)}
          </span>
          <span className="font-medium text-foreground">
            = {formatAmount(part.quantity * part.price)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Badge
          variant={part.quantity > 0 ? "secondary" : "destructive"}
          className="text-xs"
        >
          {part.quantity} шт.
        </Badge>
        <PartFormDialog
          vehicleId={vehicleId}
          part={part}
          allParts={allParts}
          trigger={
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            if (confirm(`Удалить "${part.name}" со склада?`)) {
              deletePart.mutate({ id: part.id, vehicleId })
            }
          }}
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  )
}

export function PartsInventory({ vehicleId }: PartsInventoryProps) {
  const { data: parts = [], isLoading } = useParts(vehicleId)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [search, setSearch] = useState("")

  const totalValue = parts.reduce((sum, p) => sum + p.quantity * p.price, 0)

  // Filter parts by search query
  const filteredParts = useMemo(() => {
    if (!search.trim()) return parts
    const q = search.trim().toLowerCase()
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.article && p.article.toLowerCase().includes(q)),
    )
  }, [parts, search])

  // Group filtered parts by article, ungrouped parts (no article) stay standalone
  const { groups, standalone } = useMemo(() => {
    const articleMap = new Map<string, Part[]>()
    const standalone: Part[] = []

    for (const part of filteredParts) {
      if (part.article) {
        const key = part.article.toUpperCase()
        const arr = articleMap.get(key) || []
        arr.push(part)
        articleMap.set(key, arr)
      } else {
        standalone.push(part)
      }
    }

    const groups: PartGroup[] = []
    const soloFromArticle: Part[] = []

    for (const [article, items] of articleMap) {
      if (items.length === 1) {
        soloFromArticle.push(items[0])
      } else {
        groups.push({
          article,
          name: items[0].name,
          items,
          totalQty: items.reduce((s, p) => s + p.quantity, 0),
          totalValue: items.reduce((s, p) => s + p.quantity * p.price, 0),
        })
      }
    }

    return { groups, standalone: [...soloFromArticle, ...standalone] }
  }, [filteredParts])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => setInventoryOpen(!inventoryOpen)}
        >
          {inventoryOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Package className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Склад запчастей</h2>
          {parts.length > 0 && (
            <Badge variant="secondary">{parts.length}</Badge>
          )}
          {!inventoryOpen && parts.length > 0 && (
            <span className="text-sm text-muted-foreground ml-1">
              {formatAmount(totalValue)}
            </span>
          )}
        </button>
        <PartFormDialog
          vehicleId={vehicleId}
          allParts={parts}
          trigger={
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Добавить</span>
            </Button>
          }
        />
      </div>

      {inventoryOpen && (
        <>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Загрузка...</div>
          ) : parts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Склад пуст. Добавьте запчасти для быстрого учёта при ТО.
            </div>
          ) : (
            <>
              {parts.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию или артикулу..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
              {filteredParts.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Ничего не найдено
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <PartGroupRow
                      key={group.article}
                      group={group}
                      vehicleId={vehicleId}
                      allParts={parts}
                    />
                  ))}
                  {standalone.map((part) => (
                    <SinglePartRow
                      key={part.id}
                      part={part}
                      vehicleId={vehicleId}
                      allParts={parts}
                    />
                  ))}
                </div>
              )}
              <div className="text-sm text-muted-foreground text-right">
                Общая стоимость склада: <span className="font-semibold text-foreground">{formatAmount(totalValue)}</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
