import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { assistantApi, type AssistantMessage } from "@/api/assistant"

export function useAssistantMessages(vehicleId?: string) {
  return useQuery({
    queryKey: ["assistant", vehicleId],
    queryFn: () => assistantApi.getMessages(vehicleId!),
    enabled: !!vehicleId,
  })
}

export function useSendAssistantMessage(vehicleId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (message: string) => assistantApi.chat(vehicleId, message),
    onMutate: async (newMessage) => {
      await qc.cancelQueries({ queryKey: ["assistant", vehicleId] })
      const previousMessages = qc.getQueryData<AssistantMessage[]>(["assistant", vehicleId]) || []

      const optimisticUserMsg: AssistantMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: newMessage,
        createdAt: new Date().toISOString(),
        vehicleId,
        userId: "",
      }

      qc.setQueryData<AssistantMessage[]>(["assistant", vehicleId], [
        ...previousMessages,
        optimisticUserMsg,
      ])

      return { previousMessages }
    },
    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        qc.setQueryData(["assistant", vehicleId], context.previousMessages)
      }
    },
    onSuccess: (data) => {
      qc.setQueryData<AssistantMessage[]>(["assistant", vehicleId], (old = []) => {
        // Filter out optimistic temp message and add actual server responses
        const filtered = old.filter((m) => !m.id.startsWith("temp-"))
        return [...filtered, data.userMessage, data.modelMessage]
      })

      if (data.actionTaken) {
        qc.invalidateQueries({ queryKey: ["expenses", vehicleId] })
        qc.invalidateQueries({ queryKey: ["expenses"] })
        qc.invalidateQueries({ queryKey: ["vehicles", vehicleId] })
        qc.invalidateQueries({ queryKey: ["vehicles"] })
        qc.invalidateQueries({ queryKey: ["stats", vehicleId] })
        qc.invalidateQueries({ queryKey: ["stats"] })
        qc.invalidateQueries({ queryKey: ["service-intervals", vehicleId] })
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["assistant", vehicleId] })
    },
  })
}

export function useClearAssistantMessages(vehicleId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => assistantApi.clearMessages(vehicleId),
    onSuccess: () => {
      qc.setQueryData(["assistant", vehicleId], [])
    },
  })
}
