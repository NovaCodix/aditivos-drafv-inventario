import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getProductionOrders } from '@/modules/manufacturing/services/manufacturing.service'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Órdenes de Producción' }

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT:       { label: 'Borrador',    variant: 'secondary' },
  IN_PROGRESS: { label: 'En proceso',  variant: 'default' },
  COMPLETED:   { label: 'Completada',  variant: 'default' },
  CANCELLED:   { label: 'Cancelada',   variant: 'destructive' },
}

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

async function ProductionOrdersContent({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1
  const { data: orders, count } = await getProductionOrders({
    status: searchParams.status,
    page,
    pageSize: 20,
  })

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left p-3 font-semibold">Código</th>
            <th className="text-left p-3 font-semibold">Producto</th>
            <th className="text-left p-3 font-semibold">BOM</th>
            <th className="text-left p-3 font-semibold">Estado</th>
            <th className="text-right p-3 font-semibold">Planificado</th>
            <th className="text-right p-3 font-semibold">Producido</th>
            <th className="text-right p-3 font-semibold">Avance</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-muted-foreground">
                No hay órdenes de producción
              </td>
            </tr>
          ) : orders.map(order => {
            const status = STATUS_LABELS[order.status] || { label: order.status, variant: 'outline' as const }
            return (
              <tr key={order.id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3 font-mono font-medium text-xs">{order.code}</td>
                <td className="p-3 font-medium">{order.product_name}</td>
                <td className="p-3 text-muted-foreground">{order.bom_name} v{order.bom_version}</td>
                <td className="p-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                <td className="p-3 text-right">{order.quantity_planned}</td>
                <td className="p-3 text-right">{order.quantity_produced}</td>
                <td className="p-3 text-right font-semibold">
                  {order.completion_pct?.toFixed(1) ?? '0.0'}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="p-3 text-xs text-muted-foreground border-t">
        {count} orden{count !== 1 ? 'es' : ''} en total
      </div>
    </div>
  )
}

export default async function ProductionOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Órdenes de Producción</h1>
          <p className="text-muted-foreground text-sm mt-1">Planificación y ejecución de manufactura</p>
        </div>
        <Button id="create-production-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Orden
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ProductionOrdersContent searchParams={params} />
      </Suspense>
    </div>
  )
}
