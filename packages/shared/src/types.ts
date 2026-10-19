export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  initialMileage: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  isSystem: boolean
  userId: string | null
}

export interface InventoryPart {
  id: string
  name: string
  article: string | null
  location: string | null
  quantity: number
  price: number
  vehicleId: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  amount: number
  date: string
  description: string | null
  mileage: number | null
  liters: number | null
  pricePerLiter: number | null
  bonuses: number | null
  parts: { article?: string; name: string; quantity: number; price: number }[] | null
  laborCost: number | null
  receiptPhoto?: string | null
  serviceIntervalId?: string | null
  vehicleId: string
  categoryId: string
  createdAt: string
  updatedAt: string
}

export interface AssistantMessage {
  id: string
  role: "user" | "model"
  content: string
  vehicleId: string
  userId: string
  createdAt: string
}

export interface TireSet {
  id: string
  name: string
  season: "summer" | "winter_stud" | "winter_friction" | "all_season"
  size: string | null
  productionYear: number | null
  treadDepth: number | null
  isMounted: boolean
  storageLocation: string | null
  installedMileage: number | null
  installedDate: string | null
  totalMileage: number
  notes: string | null
  vehicleId: string
  createdAt: string
  updatedAt: string
}
