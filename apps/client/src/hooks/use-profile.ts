import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "@/api/user"

export function useProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: userApi.getProfile,
  })
}

export function useUpdateEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userApi.updateEmail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] })
      qc.invalidateQueries({ queryKey: ["auth"] })
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: userApi.updatePassword,
  })
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userApi.updateNotificationSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userApi.uploadAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] })
      qc.invalidateQueries({ queryKey: ["auth"] })
    },
  })
}

export function useRemoveAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userApi.removeAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] })
      qc.invalidateQueries({ queryKey: ["auth"] })
    },
  })
}
