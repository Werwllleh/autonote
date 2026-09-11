import { useState, useRef, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useProfile, useUpdateEmail, useUpdatePassword, useUploadAvatar, useRemoveAvatar, useUpdateNotificationSettings } from "@/hooks/use-profile"
import { useAuthStore } from "@/lib/auth-store"
import { userApi } from "@/api/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Camera, Trash2, Check, AlertTriangle } from "lucide-react"

export function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const updateEmail = useUpdateEmail()
  const updatePassword = useUpdatePassword()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const updateNotificationSettings = useUpdateNotificationSettings()
  const fileRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault()
    updateEmail.mutate(
      { email, currentPassword: emailPassword },
      {
        onSuccess: () => {
          setEmailOpen(false)
          setEmailPassword("")
          setEmailSuccess(true)
          setTimeout(() => setEmailSuccess(false), 3000)
        },
      },
    )
  }

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    updatePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPasswordOpen(false)
          setCurrentPassword("")
          setNewPassword("")
          setPasswordSuccess(true)
          setTimeout(() => setPasswordSuccess(false), 3000)
        },
      },
    )
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatar.mutate(file)
    e.target.value = ""
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  if (!profile) return null

  const avatarUrl = profile.avatar
    ? `${window.location.origin}/api${profile.avatar}`
    : undefined

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Личный кабинет</h1>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Фото профиля</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl">
                {profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploadAvatar.isPending}
            >
              {uploadAvatar.isPending ? "Загрузка..." : "Загрузить фото"}
            </Button>
            {profile.avatar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAvatar.mutate()}
                disabled={removeAvatar.isPending}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Удалить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{profile.email}</span>
            {emailSuccess && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" /> Изменён
              </span>
            )}
            {!emailOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail(profile.email)
                  setEmailOpen(true)
                }}
              >
                Изменить
              </Button>
            )}
          </div>
          {emailOpen && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label>Новый email</Label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Текущий пароль</Label>
                <Input
                  required
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                />
              </div>
              {updateEmail.error && (
                <p className="text-sm text-destructive">
                  {(updateEmail.error as any)?.response?.data?.message || "Ошибка"}
                </p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={updateEmail.isPending}>
                  {updateEmail.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmailOpen(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Пароль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">••••••••</span>
            {passwordSuccess && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" /> Изменён
              </span>
            )}
            {!passwordOpen && (
              <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
                Изменить
              </Button>
            )}
          </div>
          {passwordOpen && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label>Текущий пароль</Label>
                <Input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Новый пароль</Label>
                <Input
                  required
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              {updatePassword.error && (
                <p className="text-sm text-destructive">
                  {(updatePassword.error as any)?.response?.data?.message || "Ошибка"}
                </p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={updatePassword.isPending}>
                  {updatePassword.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPasswordOpen(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Напоминать добавить расход</p>
              <p className="text-xs text-muted-foreground">
                Письмо, если по машине долго не было новых расходов. Письма о подтверждении почты отключить нельзя.
              </p>
            </div>
            <Switch
              checked={profile.expenseRemindersEnabled}
              disabled={updateNotificationSettings.isPending}
              onCheckedChange={(checked) =>
                updateNotificationSettings.mutate({ expenseRemindersEnabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-xs text-muted-foreground">
        Аккаунт создан: {new Date(profile.createdAt).toLocaleDateString("ru-RU")}
      </div>

      {/* Delete account */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Удаление аккаунта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Все ваши данные будут удалены безвозвратно: автомобили, расходы, запчасти, категории и фотографии.
          </p>
          {!deleteOpen ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Удалить аккаунт
            </Button>
          ) : (
            <form
              onSubmit={async (e: FormEvent) => {
                e.preventDefault()
                setDeleteError("")
                if (deleteConfirm !== "УДАЛИТЬ") {
                  setDeleteError("Введите УДАЛИТЬ для подтверждения")
                  return
                }
                setDeletePending(true)
                try {
                  await userApi.deleteAccount(deletePassword)
                  logout()
                  navigate("/login")
                } catch (err: any) {
                  setDeleteError(err?.response?.data?.message || "Ошибка удаления")
                } finally {
                  setDeletePending(false)
                }
              }}
              className="space-y-3"
            >
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
                Это действие необратимо. Все данные будут удалены навсегда.
              </div>
              <div className="space-y-2">
                <Label>Текущий пароль</Label>
                <Input
                  required
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Введите УДАЛИТЬ для подтверждения</Label>
                <Input
                  required
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="УДАЛИТЬ"
                />
              </div>
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={deletePending}
                >
                  {deletePending ? "Удаление..." : "Удалить навсегда"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDeleteOpen(false)
                    setDeletePassword("")
                    setDeleteConfirm("")
                    setDeleteError("")
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
