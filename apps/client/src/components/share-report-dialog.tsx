import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Copy, Check, Clock, ExternalLink } from "lucide-react"
import { reportsApi } from "@/api/reports"

interface ShareReportDialogProps {
  vehicleId: string
}

export function ShareReportDialog({ vehicleId }: ShareReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    try {
      const data = await reportsApi.create(vehicleId)
      setUrl(data.url)
      setExpiresAt(data.expiresAt)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setUrl("")
      setExpiresAt("")
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Поделиться</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Публичный отчёт</DialogTitle>
        </DialogHeader>

        {!url ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Создайте временную публичную ссылку на отчёт по автомобилю. Покупатель увидит историю расходов, ТО и пробег.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Ссылка будет действовать 24 часа</span>
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Создание..." : "Создать ссылку"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={url} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Истекает: {new Date(expiresAt).toLocaleString("ru-RU")}
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                Открыть
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
