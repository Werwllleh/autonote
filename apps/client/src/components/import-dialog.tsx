import { useState, useRef } from "react"
import { useImportExpenses } from "@/hooks/use-expenses"
import { useAuthStore } from "@/lib/auth-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react"
import type { ImportResult } from "@/api/expenses"

interface Props {
  vehicleId: string
}

export function ImportDialog({ vehicleId }: Props) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const importMutation = useImportExpenses()
  const token = useAuthStore((s) => s.accessToken)

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    importMutation.reset()
  }

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) reset()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setResult(null)
      setError(null)
    }
  }

  const handleImport = () => {
    if (!file) return
    setError(null)
    importMutation.mutate(
      { file, vehicleId },
      {
        onSuccess: (data) => {
          setResult(data)
          setFile(null)
          if (fileRef.current) fileRef.current.value = ""
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string | string[]; errors?: string[] } } })
              ?.response?.data?.errors?.join("\n") ||
            (err as { response?: { data?: { message?: string | string[] } } })
              ?.response?.data?.message ||
            "Ошибка импорта"
          setError(Array.isArray(msg) ? msg.join("\n") : String(msg))
        },
      },
    )
  }

  const handleDownloadTemplate = () => {
    if (!token) return
    fetch("/api/expenses/import/template", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "autonotes-template.csv"
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Upload className="mr-2 h-4 w-4" />
          Импорт
        </Button>
      </DialogTrigger>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="sm:hidden h-8 w-8">
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Импорт расходов</DialogTitle>
          <DialogDescription>
            Загрузите CSV или Excel файл с расходами
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download */}
          <button
            onClick={handleDownloadTemplate}
            type="button"
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border p-3 text-left text-sm transition-colors hover:bg-accent"
          >
            <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">Скачать шаблон</p>
              <p className="text-muted-foreground text-xs">
                CSV-файл с примером заполнения и заголовками
              </p>
            </div>
          </button>

          {/* File upload */}
          <div>
            <label
              htmlFor="import-file"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center transition-colors hover:bg-accent"
            >
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
              {file ? (
                <p className="text-sm font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Выберите файл</p>
                  <p className="text-xs text-muted-foreground">
                    CSV, XLS или XLSX (до 5 МБ)
                  </p>
                </>
              )}
            </label>
            <input
              ref={fileRef}
              id="import-file"
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Format hint */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Формат файла:</p>
            <p>Обязательные колонки: <span className="font-medium">Дата</span>, <span className="font-medium">Категория</span>, <span className="font-medium">Сумма</span></p>
            <p>Необязательные: Описание, Пробег, Литры, Цена за литр</p>
            <p>Разделитель: точка с запятой (;)</p>
            <p>Формат даты: ДД.ММ.ГГГГ</p>
          </div>

          {/* Result */}
          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Импортировано {result.imported} из {result.total} записей
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto text-xs text-muted-foreground space-y-0.5">
                  {result.errors.map((e, i) => (
                    <p key={i}>{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <pre className="whitespace-pre-wrap text-xs">{error}</pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {result ? "Закрыть" : "Отмена"}
            </Button>
            {!result && (
              <Button
                onClick={handleImport}
                disabled={!file || importMutation.isPending}
              >
                {importMutation.isPending ? "Импорт..." : "Импортировать"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
