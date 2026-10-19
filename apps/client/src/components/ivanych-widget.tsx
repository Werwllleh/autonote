import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import {
  X,
  Send,
  Trash2,
  ExternalLink,
  Wrench,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  useAssistantMessages,
  useSendAssistantMessage,
  useClearAssistantMessages,
} from "@/hooks/use-assistant"
import type { Vehicle } from "@/api/vehicles"

interface IvanychWidgetProps {
  vehicle: Vehicle
}

export function IvanychWidget({ vehicle }: IvanychWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const prevOpenRef = useRef(false)

  const { data: messages = [], isLoading } = useAssistantMessages(vehicle.id)
  const sendMutation = useSendAssistantMessage(vehicle.id)
  const clearMutation = useClearAssistantMessages(vehicle.id)

  const scrollToBottom = (instant = false) => {
    if (messagesContainerRef.current) {
      if (instant) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      } else {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: instant ? "instant" : "smooth" })
    }
  }

  useEffect(() => {
    if (isOpen) {
      const isJustOpened = !prevOpenRef.current
      prevOpenRef.current = true

      if (isJustOpened) {
        // Instant jump to the bottom so user immediately sees latest messages without animated scrolling down
        scrollToBottom(true)
        requestAnimationFrame(() => scrollToBottom(true))
        setTimeout(() => scrollToBottom(true), 50)
      } else {
        // Smooth scroll for new incoming messages while dialog is already open
        scrollToBottom(false)
      }
      setTimeout(() => textareaRef.current?.focus(), 150)
    } else {
      prevOpenRef.current = false
    }
  }, [isOpen, messages, sendMutation.isPending])

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text || sendMutation.isPending) return

    setInput("")
    sendMutation.mutate(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    if (confirm("Очистить историю диалога с Иванычем?")) {
      clearMutation.mutate()
    }
  }

  const promptSuggestions = [
    "Что пора менять по регламенту ТО?",
    "Запиши заправку: 2500 руб, 45 л",
    "Какие свечи зажигания подходят?",
    "Сколько всего потрачено на авто?",
  ]

  return (
    <>
      {/* Floating pulsing trigger button */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3">
          {/* Speech pill teaser */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/95 text-xs font-medium text-foreground border shadow-lg backdrop-blur hover:bg-muted transition-all duration-200 hover:scale-105"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>Спросить Иваныча</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Открыть ассистента Иваныча"
            className="group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
          >
            {/* Pulsing glow ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-primary opacity-75 blur-sm animate-pulse group-hover:opacity-100 transition-opacity" />
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500 to-primary animate-ping opacity-25" />

            {/* Avatar container */}
            <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-background bg-muted">
              <img
                src="/avatars/ivanych.webp"
                alt="Иваныч — автомеханик"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Green online badge */}
            <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-emerald-500 border-2 border-background ring-1 ring-emerald-400" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-card border shadow-2xl transition-all duration-200 overflow-hidden ${
            isExpanded
              ? "inset-4 sm:inset-10 rounded-2xl"
              : "inset-x-2 bottom-2 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:h-[620px] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40 backdrop-blur shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-full overflow-hidden border border-border bg-muted">
                  <img
                    src="/avatars/ivanych.webp"
                    alt="Иваныч"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background ring-1 ring-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm leading-none">Иваныч</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                    Автомеханик
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {vehicle.brand} {vehicle.model} • {vehicle.mileage.toLocaleString("ru-RU")} км
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Очистить чат"
                  onClick={handleClear}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex h-8 w-8 text-muted-foreground"
                title={isExpanded ? "Свернуть" : "Развернуть"}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages list */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
                Подключаем Иваныча...
              </div>
            )}

            {/* Empty state welcome */}
            {!isLoading && messages.length === 0 && (
              <div className="space-y-4 py-2">
                <div className="rounded-2xl border bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent p-4">
                  <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1.5">
                    <Wrench className="h-4 w-4 text-amber-500" />
                    <span>Здорово, дружище!</span>
                  </div>
                  <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                    Я твой персональный автомеханик. Знаю твой{" "}
                    <span className="font-semibold text-foreground">
                      {vehicle.brand} {vehicle.model}
                    </span>{" "}
                    от и до: сверю регламент ТО по пробегу, найду оригинальные артикулы и качественные
                    аналоги со ссылками на Автодок, или посчитаю расходы.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                    Популярные вопросы
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {promptSuggestions.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="text-left text-xs sm:text-[13px] px-3.5 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition-colors border border-border/50 hover:border-primary/40 flex items-center justify-between group"
                      >
                        <span>{prompt}</span>
                        <Send className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rendered messages */}
            {messages.map((m) => {
              const isUser = m.role === "user"
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 mt-0.5 border border-border">
                      <img
                        src="/avatars/ivanych.webp"
                        alt="Иваныч"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] sm:text-sm max-w-[85%] sm:max-w-[82%] leading-relaxed ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted/80 text-foreground rounded-tl-sm border border-border/60"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <FormattedMessageContent content={m.content} />
                    )}
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Pending assistant typing state */}
            {sendMutation.isPending && (
              <div className="flex gap-2.5 justify-start">
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 mt-0.5 border border-border">
                  <img
                    src="/avatars/ivanych.webp"
                    alt="Иваныч"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13.5px] sm:text-sm bg-muted/80 border border-border/60 text-muted-foreground flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  <span>Иваныч заглядывает под капот...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick confirmation banner when assistant asks to confirm deletion */}
          {(() => {
            const lastMsg = messages[messages.length - 1]
            const isAwaitingConfirmation =
              lastMsg?.role === "model" &&
              (lastMsg.content.includes("Да, удаляй") ||
                lastMsg.content.includes("удалить этот расход"))

            if (!isAwaitingConfirmation || sendMutation.isPending) return null

            return (
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-destructive/10 border-t border-destructive/20 text-xs shrink-0 animate-in fade-in slide-in-from-bottom-1">
                <span className="text-muted-foreground text-[11px] font-medium truncate">
                  Подтвердите удаление:
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs px-2.5 rounded-lg shadow-sm"
                    onClick={() => handleSend("Да, удаляй")}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Да, удаляй
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2.5 rounded-lg"
                    onClick={() => handleSend("Не удаляй, отмена")}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )
          })()}

          {/* Input Box */}
          <div className="p-3.5 border-t bg-background shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-end gap-2.5"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Спроси у Иваныча или 'Запиши заправку на 2500р'..."
                rows={2}
                disabled={sendMutation.isPending}
                className="flex-1 min-h-[64px] max-h-36 resize-none rounded-2xl border border-input bg-muted/40 px-3.5 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || sendMutation.isPending}
                className="h-11 w-11 shrink-0 rounded-2xl mb-1 shadow-sm"
                title="Отправить сообщение"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function FormattedMessageContent({ content }: { content: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }

        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")
        const lineText = isBullet ? trimmed.slice(2) : line

        return (
          <div key={idx} className={isBullet ? "flex items-start gap-1.5 ml-1" : ""}>
            {isBullet && <span className="text-primary font-bold">•</span>}
            <div className="flex-1">
              <ParseLineText text={lineText} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ParseLineText({ text }: { text: string }) {
  // Regex parsing for markdown links [Title](Url), bold **bold**, and plain URLs
  const parts: (string | React.ReactNode)[] = []
  let remaining = text
  let keyIndex = 0

  while (remaining.length > 0) {
    // 1. Check for markdown link [Label](Url)
    const linkMatch = remaining.match(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/)
    // 2. Check for bold **Bold**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/)
    // 3. Check for bare URL
    const urlMatch = remaining.match(/(https?:\/\/[^\s]+)/)

    // Find the earliest match
    let earliestIndex = remaining.length
    let matchType: "link" | "bold" | "url" | null = null
    let activeMatch: RegExpMatchArray | null = null

    if (linkMatch && linkMatch.index !== undefined && linkMatch.index < earliestIndex) {
      earliestIndex = linkMatch.index
      matchType = "link"
      activeMatch = linkMatch
    }
    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIndex) {
      earliestIndex = boldMatch.index
      matchType = "bold"
      activeMatch = boldMatch
    }
    if (urlMatch && urlMatch.index !== undefined && urlMatch.index < earliestIndex) {
      // make sure it's not part of a markdown link already checked
      if (!linkMatch || (linkMatch.index !== undefined && urlMatch.index !== linkMatch.index + linkMatch[1].length + 3)) {
        earliestIndex = urlMatch.index
        matchType = "url"
        activeMatch = urlMatch
      }
    }

    if (!matchType || !activeMatch || activeMatch.index === undefined) {
      parts.push(remaining)
      break
    }

    // Push text before match
    if (earliestIndex > 0) {
      parts.push(remaining.slice(0, earliestIndex))
    }

    if (matchType === "link") {
      const label = activeMatch[1]
      const url = activeMatch[2]
      const isAutodoc = url.includes("autodoc.ru")
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-85 ${
            isAutodoc
              ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs"
              : "text-primary"
          }`}
        >
          <span>{label}</span>
          <ExternalLink className="h-2.5 w-2.5 inline shrink-0" />
        </a>,
      )
      remaining = remaining.slice(earliestIndex + activeMatch[0].length)
    } else if (matchType === "bold") {
      const boldText = activeMatch[1]
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-foreground">
          {boldText}
        </strong>,
      )
      remaining = remaining.slice(earliestIndex + activeMatch[0].length)
    } else if (matchType === "url") {
      const url = activeMatch[1]
      const isAutodoc = url.includes("autodoc.ru")
      parts.push(
        <a
          key={`url-${keyIndex++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-85 ${
            isAutodoc
              ? "text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded text-xs"
              : "text-primary"
          }`}
        >
          <span>{isAutodoc ? "Открыть на Автодоке" : url}</span>
          <ExternalLink className="h-2.5 w-2.5 inline shrink-0" />
        </a>,
      )
      remaining = remaining.slice(earliestIndex + activeMatch[0].length)
    }
  }

  return <>{parts}</>
}
