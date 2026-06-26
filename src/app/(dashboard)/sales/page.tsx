import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TrendingUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getSalesOrders } from '@/modules/sales/services/sales.service'
import { Badge } from '@/components/ui/badge'
import { PageShell } from '@/shared/components/layout/page-shell'
import Link from 'next/link'

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
    <div className="w-full min-w-0 flex flex-col">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">
          <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Código</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Cliente</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">F. Entrega</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Almacén</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-muted-foreground">
                <TrendingUp className="w-10 h-10 opacity-20 mx-auto mb-2" />
                <p className="text-sm">No hay órdenes de venta registradas</p>
              </td>
            </tr>
          ) : orders.map((order, index) => {
            const status = STATUS_LABELS[order.status] || { label: order.status, variant: 'outline' as const }
            return (
              <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                <td className="py-3 px-6 font-mono font-medium text-xs">
                  <Link href={`/sales/${order.id}`} className="text-primary hover:underline font-semibold">
                    {order.code}
                  </Link>
                </td>
                <td className="py-3 px-6 font-medium text-sm">{order.customer_name}</td>
                <td className="py-3 px-6 text-center">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="py-3 px-6 text-muted-foreground text-xs text-center">
                  {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('es-PE') : '—'}
                </td>
                <td className="py-3 px-6 text-muted-foreground text-xs">{order.warehouse_name || '—'}</td>
                <td className="py-3 px-6 text-right font-semibold text-sm">
                  {order.currency} {order.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
        </div>
      </div>
      <DataTablePagination totalItems={count} />
    </div>
  )
}

export default async function SalesPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <PageShell
      registerButton={
        <Button render={<Link href="/sales/new" />} id="create-sale-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Orden de Venta
        </Button>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <SalesContent searchParams={params} />
      </Suspense>
    </PageShell>
  )
}
