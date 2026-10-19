import { Outlet, useNavigate, Link, useLocation } from "react-router-dom"
import { useMe, useLogout } from "@/hooks/use-auth"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, LayoutDashboard, ShieldCheck, Home } from "lucide-react"

export function Layout() {
  const { data: user } = useMe()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const avatarUrl = user?.avatar
    ? `${window.location.origin}/api${user.avatar}`
    : undefined

  const isDashboard = location.pathname === "/dashboard"

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Soft Ambient Radial Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(226,232,240,0.7),transparent_100%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(30,41,59,0.5),transparent_100%)]" />

      {/* Floating Capsule Header */}
      <header className="sticky top-0 z-50 pt-3 sm:pt-4 px-3 sm:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 sm:px-6 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          
          {/* Left: Brand Pill */}
          <Link to="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xs shadow-2xs">
              AN
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-950 dark:text-white text-sm">AUTONOTES</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ГАРАЖ
              </span>
            </div>
          </Link>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Главная</span>
            </Link>

            {!isDashboard && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-full h-8 px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                asChild
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
                  <span>Гараж</span>
                </Link>
              </Button>
            )}

            <ThemeToggle />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-slate-400">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                        {user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xl bg-white dark:bg-slate-900">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold truncate text-slate-950 dark:text-white">{user.name || user.email}</p>
                    {user.name && (
                      <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-xl text-xs font-medium py-2">
                    <User className="mr-2 h-4 w-4" />
                    Личный кабинет
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="rounded-xl text-xs font-medium py-2">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Админ-панель
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />
                  <DropdownMenuItem onClick={logout} className="rounded-xl text-xs font-medium py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30">
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти из аккаунта
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
