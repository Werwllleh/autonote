import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = [
  "hsl(220, 70%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(30, 80%, 55%)",
  "hsl(350, 65%, 55%)",
  "hsl(270, 50%, 55%)",
  "hsl(45, 80%, 50%)",
  "hsl(190, 60%, 45%)",
  "hsl(0, 0%, 55%)",
]

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

export function CategoryPieChart({ data }: Props) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-muted-foreground">
        Нет данных
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatAmount(value as number)}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            color: "hsl(var(--card-foreground))",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
