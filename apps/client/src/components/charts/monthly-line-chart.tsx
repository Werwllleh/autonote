import {
  LineChart,
  Line,
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
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Нет данных
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" className="text-xs" />
        <YAxis
          width={80}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}т`}
          className="text-xs"
        />
        <Tooltip formatter={(value: number) => formatAmount(value)} />
        <Line
          type="monotone"
          dataKey="amount"
          name="Расходы"
          stroke="hsl(220, 70%, 50%)"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
