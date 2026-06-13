import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, BarChart3, AlertTriangle, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getInventorySummary } from '@/modules/stock-movements/services/movements.service'
import { STOCK_STATUS } from '@/shared/constants'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Inventario' }

async function InventoryContent() {
  const inventory = await getInventorySummary()

  const total = inventory.length
  const lowStock = inventory.filter(i => i.stock_status === 'LOW_STOCK').length
  const outOfStock = inventory.filter(i => i.stock_status === 'OUT_OF_STOCK').length

  return (
    <div className="space-y-0">
      {/* Stats — con padding para que no toquen los bordes del card */}
      <div className="px-4 md:px-6 pt-5 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            <BarChart3 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card className="card-glow-yellow overflow-hidden gap-0 border-0 shadow-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Bajo</CardTitle>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
          </CardContent>
        </Card>
        <Card className="card-glow-red overflow-hidden gap-0 border-0 shadow-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agotados</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <div className="w-full min-w-0 flex flex-col">
        <div className="px-4 md:px-6 pt-2 pb-4">
        <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">
          <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">SKU</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Producto</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Almacén</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Stock</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Mínimo</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300"></th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                  No hay datos de inventario
                </td>
              </tr>
            ) : (
              inventory.map((item, index) => {
                const status = STOCK_STATUS[item.stock_status as keyof typeof STOCK_STATUS]
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    id={`inventory-row-${item.id}`}
                  >
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
                        {item.sku}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{item.product_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.warehouse_name}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground font-mono text-xs">
                      {item.minimum_stock}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.bg} ${status?.text}`}>
                        {status?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" render={<a href={`/movements?product_id=${item.product_id}`} id={`view-movements-${item.id}`} />}>
                          Kardex
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Pagination */}
      <DataTablePagination totalItems={10} />
    </div>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <PageShell
      registerButton={
        <Button id="register-movement-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Movimiento
        </Button>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <InventoryContent />
      </Suspense>
    </PageShell>
  )
}
