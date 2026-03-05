import { Link } from "react-router-dom"
import type { Vehicle } from "@/api/vehicles"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Gauge } from "lucide-react"

interface Props {
  vehicle: Vehicle
  totalExpenses: number
  topCategory?: string
  view: "grid" | "list"
}

function formatMileage(km: number) {
  return km.toLocaleString("ru-RU") + " км"
}

function formatAmount(amount: number) {
  return amount.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 })
}

export function VehicleCard({ vehicle, totalExpenses, topCategory, view }: Props) {
  if (view === "list") {
    return (
      <Link to={`/vehicles/${vehicle.id}`}>
        <div className="flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-accent">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Car className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {vehicle.brand} {vehicle.model}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{vehicle.year}</span>
              <span className="flex items-center gap-1">
                <Gauge className="h-3 w-3" />
                {formatMileage(vehicle.mileage)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold">{formatAmount(totalExpenses)}</p>
            {topCategory && (
              <Badge variant="secondary" className="text-xs">{topCategory}</Badge>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/vehicles/${vehicle.id}`}>
      <Card className="transition-colors hover:bg-accent/50 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Car className="h-5 w-5 text-muted-foreground" />
            </div>
            {topCategory && (
              <Badge variant="secondary" className="text-xs">{topCategory}</Badge>
            )}
          </div>
          <CardTitle className="text-base mt-3">
            {vehicle.brand} {vehicle.model}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{vehicle.year}</span>
            <span className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {formatMileage(vehicle.mileage)}
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold">{formatAmount(totalExpenses)}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
