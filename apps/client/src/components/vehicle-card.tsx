import { Link } from "react-router-dom"
import type { Vehicle } from "@/api/vehicles"
import { Card } from "@/components/ui/card"
import { Car } from "lucide-react"

interface Props {
  vehicle: Vehicle
  costPerKm?: number | null
  view: "grid" | "list"
}

export function VehicleCard({ vehicle, costPerKm, view }: Props) {
  const photo = vehicle.photo ? `/api${vehicle.photo}` : null

  if (view === "list") {
    return (
      <Link to={`/vehicles/${vehicle.id}`}>
        <div className="flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-accent">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
            {photo ? (
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <Car className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
          </div>
          {costPerKm != null && costPerKm > 0 && (
            <span className="text-xs text-muted-foreground shrink-0">
              {costPerKm.toFixed(1)} ₽/км
            </span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/vehicles/${vehicle.id}`}>
      <Card className="overflow-hidden transition-colors hover:bg-accent/50 h-full">
        <div className={photo ? "flex" : ""}>
          {photo && (
            <div className="w-[38%] shrink-0">
              <img
                src={photo}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className={photo ? "flex flex-col justify-center p-5" : "p-5"}>
            {!photo && (
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Car className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <h3 className="text-base font-semibold">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{vehicle.year}</p>
            {costPerKm != null && costPerKm > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                ~{costPerKm.toFixed(1)} ₽/км
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
