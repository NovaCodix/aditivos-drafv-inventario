import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TrendingUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getSalesOrders } from '@/modules/sales/services/sales.service'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Ventas' }

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  CONFIRMED:  { label: 'Confirmada',  variant: 'default' },
  PROCESSING: { label: 'En proceso',  variant: 'secondary' },
  PARTIAL:    { label: 'Parcial',     variant: 'outline' },
  DELIVERED:  { label: 'Entregada',   variant: 'default' },
  CANCELLED:  { label: 'Cancelada',   variant: 'destructive' },
}

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}

async function SalesContent({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1
  const { data: orders, count } = await getSalesOrders({
    search: searchParams.search,
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
            <th className="text-left p-3 font-semibold">Cliente</th>
            <th className="text-left p-3 font-semibold">Estado</th>
            <th className="text-left p-3 font-semibold">F. Entrega</th>
            <th className="text-left p-3 font-semibold">Almacén</th>
            <th className="text-right p-3 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground">
                No hay órdenes de venta registradas
              </td>
            </tr>
          ) : orders.map(order => {
            const status = STATUS_LABELS[order.status] || { label: order.status, variant: 'outline' as const }
            return (
              <tr key={order.id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3 font-mono font-medium text-xs">{order.code}</td>
                <td className="p-3 font-medium">{order.customer_name}</td>
                <td className="p-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('es-PE') : '—'}
                </td>
                <td className="p-3 text-muted-foreground">{order.warehouse_name || '—'}</td>
                <td className="p-3 text-right font-semibold">
                  {order.currency} {order.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
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

export default async function SalesPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de cotizaciones, órdenes y entregas</p>
        </div>
        <Button id="create-sale-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Orden de Venta
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <SalesContent searchParams={params} />
      </Suspense>
    </div>
  )
}
