import { Link } from "react-router-dom"
import type { Vehicle } from "@/api/vehicles"
import { Card } from "@/components/ui/card"
import { Car, ChevronRight, Gauge } from "lucide-react"

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
        <div className="flex items-center gap-4 rounded-lg border px-4 py-3 transition-all hover:bg-accent hover:shadow-sm">
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
    <Link to={`/vehicles/${vehicle.id}`} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-md hover:border-border/80 h-full">
        <div className={photo ? "flex" : ""}>
          {photo ? (
            <div className="w-[38%] shrink-0 relative overflow-hidden">
              <img
                src={photo}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : null}
          <div className={photo ? "flex flex-col justify-center p-5 flex-1" : "p-5"}>
            {!photo && (
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <Car className="h-6 w-6 text-primary/60" />
              </div>
            )}
            <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
              {vehicle.brand} {vehicle.model}
            </h3>
            <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
              <span>{vehicle.year}</span>
              {vehicle.mileage > 0 && (
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  {vehicle.mileage.toLocaleString("ru-RU")} км
                </span>
              )}
            </div>
            {costPerKm != null && costPerKm > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                ~{costPerKm.toFixed(1)} ₽/км
              </p>
            )}
            <div className="mt-2 flex items-center gap-1 text-xs text-primary/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Подробнее</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
