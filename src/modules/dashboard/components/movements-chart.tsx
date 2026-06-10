'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface MovementsChartProps {
  data: { date: string; entries: number; exits: number }[]
}

export function MovementsChart({ data }: MovementsChartProps) {
  const formatDate = (dateStr: any) => {
    try {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
      })
    } catch {
      return dateStr || ''
    }
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dx={-10}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            borderRadius: '12px',
            fontSize: '11px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
            color: 'var(--foreground)',
          }}
          itemStyle={{
            color: 'var(--foreground)'
          }}
          labelStyle={{
            fontWeight: 700,
            marginBottom: '4px',
            color: 'var(--foreground)'
          }}
          formatter={(value, name) => [
            value,
            name === 'entries' ? 'Entradas' : 'Salidas',
          ]}
          labelFormatter={formatDate}
        />
        <Legend
          formatter={value => (
            <span className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider pl-1">
              {value === 'entries' ? 'Entradas' : 'Salidas'}
            </span>
          )}
          wrapperStyle={{ paddingTop: '15px' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="entries"
          fill="oklch(0.48 0.22 255)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="exits"
          fill="oklch(0.55 0.22 27)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
