import { useEffect } from "react"
import { useThemeStore, applyTheme } from "@/lib/theme-store"

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    applyTheme(theme)

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => applyTheme("system")
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [theme])

  return { theme, setTheme }
}
