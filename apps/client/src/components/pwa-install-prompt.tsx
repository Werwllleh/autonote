import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Share, PlusSquare, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent.toLowerCase()
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  return isMobileUA || isIPadOS
}

export function PwaInstallPrompt() {
  const [isMobile, setIsMobile] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // 0. Only show on mobile devices (smartphones and tablets)
    if (!isMobileDevice()) {
      return
    }
    setIsMobile(true)

    // 1. Check if app is already running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      setIsStandalone(isStandaloneMode)
      return isStandaloneMode
    }

    if (checkStandalone()) {
      return
    }

    // 2. Platform detection
    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    const android = /android/.test(ua)
    setIsIOS(ios)

    // 3. Check dismissal in localStorage (expires after 3 days)
    const dismissedTime = localStorage.getItem("autonotes_pwa_prompt_dismissed")
    const now = Date.now()
    const isDismissed = dismissedTime && now - parseInt(dismissedTime, 10) < 3 * 24 * 60 * 60 * 1000

    // 4. Capture browser beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!isDismissed) {
        setIsVisible(true)
      }
    }

    // 5. Detect app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // If mobile user visits and prompt is not dismissed, show after 2.5 seconds
    let timer: ReturnType<typeof setTimeout> | undefined
    if ((android || ios) && !isDismissed) {
      timer = setTimeout(() => {
        setIsVisible(true)
      }, 2500)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      if (timer) clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("autonotes_pwa_prompt_dismissed", Date.now().toString())
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
          setIsVisible(false)
          setIsInstalled(true)
        }
        setDeferredPrompt(null)
      } catch (err) {
        // Fallback to guide modal if prompt fails
        setShowGuideModal(true)
      }
    } else {
      // If browser beforeinstallprompt hasn't fired or is iOS, show manual step-by-step guide
      setShowGuideModal(true)
    }
  }

  if (!isMobile || isStandalone || isInstalled) {
    return null
  }

  return (
    <>
      {/* Floating Bottom Install Capsule / Banner */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] z-50"
          >
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              
              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                aria-label="Закрыть"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-3.5 pr-6">
                <div className="relative shrink-0">
                  <img
                    src="/icons/icon-192.png"
                    alt="AutoNotes"
                    className="h-12 w-12 rounded-2xl border border-slate-200 shadow-sm object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xs">
                    <Download className="h-2.5 w-2.5" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-950 truncate">AutoNotes</h4>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600 font-semibold">
                      PWA
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    Установите приложение на экран смартфона
                  </p>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  {isIOS ? "Для Safari на iPhone" : "Мгновенный запуск и офлайн"}
                </span>
                
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex h-9 items-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-mono font-bold text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Установить</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Installation Guide Modal (For iOS Safari or Android when prompt is suppressed) */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuideModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl z-10"
            >
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-950 shrink-0">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">
                    Установка AutoNotes
                  </h3>
                  <p className="text-xs text-slate-500">Инструкция для вашего браузера</p>
                </div>
              </div>

              {isIOS ? (
                /* iOS Safari instructions */
                <div className="mt-5 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    На устройствах Apple установка выполняется через стандартное меню Safari:
                  </p>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold shrink-0 text-[11px]">
                        1
                      </div>
                      <div className="text-slate-700 pt-0.5">
                        Нажмите кнопку <strong className="text-slate-950">«Поделиться»</strong>{" "}
                        <Share className="inline h-3.5 w-3.5 text-sky-600 mx-1" /> в нижней панели Safari.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold shrink-0 text-[11px]">
                        2
                      </div>
                      <div className="text-slate-700 pt-0.5">
                        Прокрутите меню вниз и выберите{" "}
                        <strong className="text-slate-950">«На экран "Домой"»</strong>{" "}
                        <PlusSquare className="inline h-3.5 w-3.5 text-slate-950 mx-1" />.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold shrink-0 text-[11px]">
                        3
                      </div>
                      <div className="text-slate-700 pt-0.5">
                        В правом верхнем углу нажмите <strong className="text-emerald-600">«Добавить»</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Android Chrome instructions */
                <div className="mt-5 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Если системный диалог Chrome заблокирован или не появился автоматически:
                  </p>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold shrink-0 text-[11px]">
                        1
                      </div>
                      <div className="text-slate-700 pt-0.5">
                        Нажмите меню браузера <strong className="text-slate-950">три точки (⋮)</strong> в верхнем правом углу экрана.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold shrink-0 text-[11px]">
                        2
                      </div>
                      <div className="text-slate-700 pt-0.5">
                        Выберите пункт <strong className="text-slate-950">«Установить приложение»</strong> или{" "}
                        <strong className="text-slate-950">«Добавить на главный экран»</strong>.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold shrink-0 text-[11px]">
                        3
                      </div>
                      <div className="text-slate-700 pt-0.5">
                        Подтвердите установку — ярлык появится на вашем рабочем столе.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="rounded-full bg-slate-950 px-6 py-2.5 text-xs font-mono font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Понятно
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
