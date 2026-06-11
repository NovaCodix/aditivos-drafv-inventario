import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ShoppingCart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getPurchaseOrders } from '@/modules/purchases/services/purchases.service'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Compras' }

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT:     { label: 'Borrador',   variant: 'secondary' },
  SENT:      { label: 'Enviada',    variant: 'default' },
  PARTIAL:   { label: 'Parcial',    variant: 'outline' },
  RECEIVED:  { label: 'Recibida',   variant: 'default' },
  CANCELLED: { label: 'Cancelada',  variant: 'destructive' },
}

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}

async function PurchasesContent({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1
  const { data: orders, count } = await getPurchaseOrders({
    search: searchParams.search,
    status: searchParams.status,
    page,
    pageSize: 20,
  })

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center p-3 font-semibold">Código</th>
            <th className="text-center p-3 font-semibold">Proveedor</th>
            <th className="text-center p-3 font-semibold">Estado</th>
            <th className="text-center p-3 font-semibold">F. Esperada</th>
            <th className="text-center p-3 font-semibold">Total</th>
            <th className="text-center p-3 font-semibold">Creada por</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground">
                No hay órdenes de compra registradas
              </td>
            </tr>
          ) : orders.map(order => {
            const status = STATUS_LABELS[order.status] || { label: order.status, variant: 'outline' as const }
            return (
              <tr key={order.id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-3 font-mono font-medium text-xs">{order.code}</td>
                <td className="p-3 font-medium">{order.supplier_name}</td>
                <td className="p-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {order.expected_date ? new Date(order.expected_date).toLocaleDateString('es-PE') : '—'}
                </td>
                <td className="p-3 text-right font-semibold">
                  {order.currency} {order.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-muted-foreground">{order.created_by_name || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <DataTablePagination totalItems={count} />
    </div>
  )
}

export default async function PurchasesPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compras</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de órdenes de compra y recepciones</p>
        </div>
        <Button id="create-purchase-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Orden de Compra
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <PurchasesContent searchParams={params} />
      </Suspense>
    </div>
  )
}
