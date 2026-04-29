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
import { Car, LogOut, User, LayoutDashboard, ShieldCheck } from "lucide-react"

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
    <div className="min-h-screen bg-background">
      {/* Subtle gradient overlay at top */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/[0.03] to-transparent" />

      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-semibold transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
              <Car className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">AutoNotes</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {!isDashboard && (
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Гараж</span>
                </Link>
              </Button>
            )}
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 ring-2 ring-border">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary/10 to-primary/5">
                        {user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                    {user.name && (
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Личный кабинет
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Админ-панель
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
