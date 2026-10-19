import { api } from "./client"

export interface AssistantMessage {
  id: string
  role: "user" | "model"
  content: string
  createdAt: string
  vehicleId: string
  userId: string
}

export interface ChatResponse {
  userMessage: AssistantMessage
  modelMessage: AssistantMessage
  actionTaken?: "created" | "deleted" | null
}

export const assistantApi = {
  getMessages: (vehicleId: string) =>
    api
      .get<AssistantMessage[]>(`/vehicles/${vehicleId}/assistant/messages`)
      .then((r) => r.data),

  chat: (vehicleId: string, message: string) =>
    api
      .post<ChatResponse>(
        `/vehicles/${vehicleId}/assistant/chat`,
        { message },
      )
      .then((r) => r.data),

  clearMessages: (vehicleId: string) =>
    api
      .delete<{ success: boolean }>(`/vehicles/${vehicleId}/assistant/messages`)
      .then((r) => r.data),
}
