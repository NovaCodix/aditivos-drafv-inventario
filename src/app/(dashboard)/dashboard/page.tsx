import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingDown,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getDashboardStats } from '@/modules/dashboard/services/dashboard.service'
import { MovementsChart } from '@/modules/dashboard/components/movements-chart'
import { formatDateTime } from '@/shared/lib/utils'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard',
}

// Revalidar cada 5 minutos
export const revalidate = 300

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: React.ElementType
  className?: string
  badgeText?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  iconClassName?: string
  trend?: {
    value: string
    isPositive: boolean
    label: string
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  badgeText,
  badgeVariant,
  iconClassName,
  trend,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden rounded-2xl border border-border/40 bg-card/65 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:border-border/70", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
          {title}
        </span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm", iconClassName || "bg-primary/10 text-primary")}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">{value}</span>
          {badgeText && (
            <Badge variant={badgeVariant || 'secondary'} className={cn(
              "text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 border",
              badgeVariant === 'destructive' 
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20' 
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
            )}>
              {badgeText}
            </Badge>
          )}
        </div>
        
        {trend ? (
          <div className="flex items-center gap-1.5 text-[11px] font-medium leading-none">
            <span className={cn(
              "flex items-center gap-0.5 font-bold",
              trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-450"
            )}>
              {trend.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {trend.value}
            </span>
            <span className="text-muted-foreground/60">{trend.label}</span>
          </div>
        ) : description ? (
          <p className="text-[11px] text-muted-foreground/80 font-medium">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function MovementTypeBadge({ type }: { type: string }) {
  const config = {
    ENTRY: { label: 'Entrada', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25' },
    EXIT: { label: 'Salida', className: 'bg-rose-500/10 text-rose-700 dark:text-rose-450 border-rose-500/25' },
    TRANSFER_IN: { label: 'Transf. Entrada', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25' },
    TRANSFER_OUT: { label: 'Transf. Salida', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-450 border-amber-500/25' },
    ADJUSTMENT: { label: 'Ajuste', className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25' },
  }[type] || { label: type, className: 'bg-muted text-muted-foreground border-border/40' }

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", config.className)}>
      {config.label}
    </span>
  )
}

async function DashboardContent() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8 animate-slide-up">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total de Productos"
          value={stats.totalProducts}
          trend={{ value: '+12%', isPositive: true, label: 'este mes' }}
          icon={Package}
          className="card-glow-blue"
          iconClassName="bg-blue-500/10 text-blue-500 dark:text-blue-400"
        />
        <StatCard
          title="Almacenes"
          value={stats.totalWarehouses}
          trend={{ value: 'Estable', isPositive: true, label: 'sin cambios' }}
          icon={Warehouse}
          className="card-glow-green"
          iconClassName="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStockCount}
          trend={stats.lowStockCount > 0 ? { value: `${stats.lowStockCount} alert.`, isPositive: false, label: 'requiere atención' } : undefined}
          description="Productos por debajo del mínimo"
          icon={AlertTriangle}
          className="card-glow-yellow"
          iconClassName="bg-amber-500/10 text-amber-500 dark:text-amber-400"
          badgeText={stats.lowStockCount > 0 ? 'Atención' : undefined}
          badgeVariant="secondary"
        />
        <StatCard
          title="Productos Agotados"
          value={stats.outOfStockCount}
          trend={stats.outOfStockCount > 0 ? { value: `Crítico`, isPositive: false, label: 'sin stock' } : undefined}
          description="Productos sin stock disponible"
          icon={TrendingDown}
          className="card-glow-red"
          iconClassName="bg-rose-500/10 text-rose-500 dark:text-rose-450"
          badgeText={stats.outOfStockCount > 0 ? 'Crítico' : undefined}
          badgeVariant={stats.outOfStockCount > 0 ? 'destructive' : 'secondary'}
        />
      </div>

      {/* Charts + Movements */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gráfico de movimientos */}
        <Card className="xl:col-span-2 border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="border-b border-border/20 pb-4">
            <CardTitle className="text-base font-bold text-foreground">Movimientos de Inventario</CardTitle>
            <CardDescription className="text-xs">Entradas y salidas registradas en los últimos 14 días</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.movementsByDay.length > 0 ? (
              <MovementsChart data={stats.movementsByDay} />
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground gap-2">
                <RefreshCw className="w-8 h-8 opacity-30 animate-spin" />
                <p className="text-sm font-medium">No hay movimientos en los últimos 14 días</p>
                <p className="text-xs opacity-60">Los datos aparecerán aquí cuando registres movimientos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividad diaria */}
        <Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="border-b border-border/20 pb-4">
            <CardTitle className="text-base font-bold text-foreground">Resumen de Actividad</CardTitle>
            <CardDescription className="text-xs">Indicadores de transacciones del día de hoy</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 transition-all hover:bg-emerald-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shadow-sm">
                    <ArrowDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Entradas hoy</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/15">
                  {stats.movementsByDay.at(-1)?.entries || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 transition-all hover:bg-rose-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center shadow-sm">
                    <ArrowUp className="w-4 h-4 text-rose-600 dark:text-rose-455" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Salidas hoy</span>
                </div>
                <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/15">
                  {stats.movementsByDay.at(-1)?.exits || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 transition-all hover:bg-amber-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-455" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Alertas críticas</span>
                </div>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/15">
                  {stats.lowStockCount + stats.outOfStockCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos movimientos */}
      <Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="border-b border-border/20 pb-4">
          <CardTitle className="text-base font-bold text-foreground">Últimos Movimientos</CardTitle>
          <CardDescription className="text-xs">Registro en tiempo real de las últimas 10 transacciones del almacén</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 px-0 pb-0">
          {stats.recentMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2.5">
              <Package className="w-10 h-10 opacity-20" />
              <p className="text-sm font-semibold">No hay movimientos registrados</p>
              <p className="text-xs opacity-60">
                Registra una entrada de inventario para comenzar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    <th className="text-left py-3.5 px-6 text-muted-foreground/75 font-semibold text-[10px] uppercase tracking-wider">Tipo</th>
                    <th className="text-left py-3.5 px-6 text-muted-foreground/75 font-semibold text-[10px] uppercase tracking-wider">Producto (UUID)</th>
                    <th className="text-right py-3.5 px-6 text-muted-foreground/75 font-semibold text-[10px] uppercase tracking-wider">Cantidad</th>
                    <th className="text-left py-3.5 px-6 text-muted-foreground/75 font-semibold text-[10px] uppercase tracking-wider hidden md:table-cell">Notas</th>
                    <th className="text-right py-3.5 px-6 text-muted-foreground/75 font-semibold text-[10px] uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25">
                  {stats.recentMovements.map(movement => (
                    <tr
                      key={movement.id}
                      className="hover:bg-muted/30 transition-all duration-200"
                    >
                      <td className="py-3.5 px-6">
                        <MovementTypeBadge type={movement.movement_type} />
                      </td>
                      <td className="py-3.5 px-6 text-xs font-mono text-muted-foreground/80">
                        {movement.product_id}
                      </td>
                      <td className="py-3.5 px-6 text-right font-semibold text-foreground">
                        {movement.quantity}
                      </td>
                      <td className="py-3.5 px-6 text-muted-foreground hidden md:table-cell text-xs max-w-40 truncate">
                        {movement.notes || '—'}
                      </td>
                      <td className="py-3.5 px-6 text-right text-muted-foreground text-xs font-medium">
                        {formatDateTime(movement.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3.5 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 rounded-2xl border-border/40">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-60 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen del sistema de inventario de Aditivos DRAFV
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
