import { useState } from "react"
import { useAdminStats, useAdminUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Car,
  Receipt,
  Wallet,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react"
import type { AdminUser, AdminUserDetail } from "@/api/admin"
import { adminApi } from "@/api/admin"

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
    month: "short",
    year: "numeric",
  })
}

function UserDetailDialog({ user, onClose }: { user: AdminUserDetail | null; onClose: () => void }) {
  if (!user) return null

  return (
    <Dialog open={!!user} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar ? `/api${user.avatar}` : undefined} />
              <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div>{user.name || user.email}</div>
              {user.name && <div className="text-sm font-normal text-muted-foreground">{user.email}</div>}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Роль</span>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <Badge variant={user.emailVerified ? "secondary" : "destructive"}>
                {user.emailVerified ? "Подтверждён" : "Не подтверждён"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Регистрация</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Последний вход</span>
              <span>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "никогда"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Последняя активность</span>
              <span>{user.lastActivityAt ? formatDate(user.lastActivityAt) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
            </div>
          </div>

          {user.vehicles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Автомобили ({user.vehicles.length})</h4>
              {user.vehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium">{v.brand} {v.model}</span>
                    <span className="text-muted-foreground ml-2">{v.year}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {v.mileage.toLocaleString()} км · {v._count.expenses} расх.
                  </div>
                </div>
              ))}
            </div>
          )}

          {user.vehicles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет автомобилей
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AdminPage() {
  const [search, setSearch] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [unverifiedOnly, setUnverifiedOnly] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null)

  const { data: stats } = useAdminStats()
  const { data: usersData, isLoading } = useAdminUsers(page, searchQuery || undefined, unverifiedOnly)
  const updateRole = useUpdateUserRole()
  const deleteUser = useDeleteUser()

  const handleSearch = () => {
    setSearchQuery(search)
    setPage(1)
  }

  const handleViewUser = async (userId: string) => {
    const user = await adminApi.getUser(userId)
    setSelectedUser(user)
  }

  const handleDeleteUser = (user: AdminUser) => {
    if (!confirm(`Удалить пользователя ${user.email}? Все данные будут удалены безвозвратно.`)) return
    deleteUser.mutate(user.id)
  }

  const handleRoleChange = (userId: string, role: "USER" | "ADMIN") => {
    updateRole.mutate({ id: userId, role })
  }

  const totalPages = usersData ? Math.ceil(usersData.total / usersData.limit) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Админ-панель
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Управление пользователями и данными</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/10">
                  <Users className="h-3 w-3 text-blue-500" />
                </div>
                Пользователи
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{stats.userCount}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10">
                  <Car className="h-3 w-3 text-emerald-500" />
                </div>
                Автомобили
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{stats.vehicleCount}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/10">
                  <Receipt className="h-3 w-3 text-amber-500" />
                </div>
                Расходов
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{stats.expenseCount}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-violet-500/10">
                  <Wallet className="h-3 w-3 text-violet-500" />
                </div>
                Общая сумма
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold">{formatAmount(stats.totalAmount)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Пользователи</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  id="unverified-only"
                  checked={unverifiedOnly}
                  onCheckedChange={(checked) => {
                    setUnverifiedOnly(checked)
                    setPage(1)
                  }}
                />
                <Label htmlFor="unverified-only" className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                  Только неподтверждённые
                </Label>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по email или имени..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleSearch}>
                  Найти
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Загрузка...</div>
          ) : !usersData || usersData.users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Пользователи не найдены</div>
          ) : (
            <>
              <div className="space-y-2">
                {usersData.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-lg border px-3 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={user.avatar ? `/api${user.avatar}` : undefined} />
                      <AvatarFallback className="text-xs">
                        {user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {user.name || user.email}
                        </span>
                        {user.role === "ADMIN" && (
                          <Badge variant="default" className="text-xs shrink-0">
                            <Shield className="h-3 w-3 mr-0.5" />
                            Admin
                          </Badge>
                        )}
                        {!user.emailVerified && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            Не подтверждён
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        {user.name && <span>{user.email}</span>}
                        <span>{user.vehicleCount} авто</span>
                        <span>{user.expenseCount} расх.</span>
                        {user.expenseTotal > 0 && (
                          <span className="hidden sm:inline">{formatAmount(user.expenseTotal)}</span>
                        )}
                        <span className="hidden md:inline">
                          Вход: {user.lastLoginAt ? formatDate(user.lastLoginAt) : "никогда"}
                        </span>
                        <span className="hidden md:inline">
                          Активность: {user.lastActivityAt ? formatDate(user.lastActivityAt) : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block mr-2">
                        {formatDate(user.createdAt)}
                      </span>

                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v as "USER" | "ADMIN")}
                      >
                        <SelectTrigger className="h-8 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {usersData.total} пользователей
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UserDetailDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  )
}
