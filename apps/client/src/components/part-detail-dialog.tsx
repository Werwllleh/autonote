import { useState } from "react"
import type { Part } from "@/api/parts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

function formatAmount(amount: number) {
  return amount.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface PartDetailDialogProps {
  part: Part
  children: React.ReactNode
}

export function PartDetailDialog({ part, children }: PartDetailDialogProps) {
  const [open, setOpen] = useState(false)

  const totalValue = part.quantity * part.price

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        className="cursor-pointer"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          setOpen(true)
        }}
      >
        {children}
      </div>
      <DialogContent className="sm:max-w-sm max-sm:!top-auto max-sm:!bottom-0 max-sm:!translate-y-0 max-sm:!translate-x-[-50%] max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <DialogTitle>{part.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
            {part.article && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Артикул</span>
                <span className="font-mono">{part.article}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Количество</span>
              <Badge variant={part.quantity > 0 ? "secondary" : "destructive"}>
                {part.quantity} шт.
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Цена за шт.</span>
              <span>{formatAmount(part.price)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border/50 pt-2">
              <span>Стоимость</span>
              <span>{formatAmount(totalValue)}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Добавлено: {formatDate(part.createdAt)}
            {part.updatedAt !== part.createdAt && (
              <> · Обновлено: {formatDate(part.updatedAt)}</>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
