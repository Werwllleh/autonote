import { Link } from "react-router-dom"
import type { Vehicle } from "@/api/vehicles"
import { Car, ArrowUpRight, Gauge } from "lucide-react"

interface Props {
  vehicle: Vehicle
  costPerKm?: number | null
  view: "grid" | "list"
}

export function VehicleCard({ vehicle, costPerKm, view }: Props) {
  const photo = vehicle.photo ? `/api${vehicle.photo}` : null

  if (view === "list") {
    return (
      <Link to={`/vehicles/${vehicle.id}`} className="group block">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 transition-all hover:border-slate-300 hover:shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
            {photo ? (
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <Car className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-950 dark:text-white truncate">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-xs font-mono text-slate-500 mt-0.5">{vehicle.year} г.в.</p>
          </div>
          {costPerKm != null && costPerKm > 0 && (
            <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 shrink-0">
              {costPerKm.toFixed(1)} ₽/км
            </span>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-colors shrink-0">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/vehicles/${vehicle.id}`} className="group block h-full">
      <div className="h-full rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between">
        <div>
          {photo ? (
            <div className="w-full h-44 rounded-2xl overflow-hidden mb-5 relative bg-slate-100 dark:bg-slate-800">
              <img
                src={photo}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[11px] font-mono text-white">
                {vehicle.year}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                <Car className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-0.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                {vehicle.year}
              </span>
            </div>
          )}

          <div className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-500 font-bold">
            {vehicle.brand}
          </div>
          <h3 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            {vehicle.model}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500">
            <Gauge className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {vehicle.mileage > 0
                ? `${vehicle.mileage.toLocaleString("ru-RU")} км`
                : "Пробег не указан"}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
              СТОИМОСТЬ КМ
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {costPerKm != null && costPerKm > 0 ? `~${costPerKm.toFixed(1)} ₽ / км` : "—"}
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all group-hover:bg-slate-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-950">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
