import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format, parse } from "date-fns"
import { ru } from "date-fns/locale"

interface Props {
  data: Record<string, number>
}

function formatAmount(value: number) {
  return value.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  })
}

export function MonthlyLineChart({ data }: Props) {
  const chartData = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month,
      label: format(parse(month, "yyyy-MM", new Date()), "LLL yy", {
        locale: ru,
      }),
      amount,
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-muted-foreground">
        Нет данных
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={false}
        />
        <YAxis
          width={60}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}т`}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => formatAmount(value as number)}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            color: "hsl(var(--card-foreground))",
          }}
          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          name="Расходы"
          stroke="hsl(220, 70%, 50%)"
          strokeWidth={2}
          fill="url(#colorAmount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
