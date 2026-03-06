export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
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
  vehicleId: string
  categoryId: string
  createdAt: string
  updatedAt: string
}
