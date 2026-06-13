import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Plus, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getBatches } from '@/modules/batches/services/batches.service'
import { formatDate } from '@/shared/lib/utils'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Lotes' }

async function BatchesContent() {
  const { data: batches } = await getBatches({ pageSize: 50 })

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  return (
    <div className="overflow-x-auto">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">N° Lote</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Producto</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Fabricación</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Vencimiento</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Cantidad</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-muted-foreground">
                <Layers className="w-10 h-10 opacity-20 mx-auto mb-2" />
                <p className="text-sm">No hay lotes registrados</p>
              </td>
            </tr>
          ) : (
            batches.map((batch, index) => {
              const expDate = batch.expiration_date ? new Date(batch.expiration_date) : null
              const isExpired = expDate ? expDate < now : false
              const isExpiringSoon = expDate ? (expDate >= now && expDate <= thirtyDaysFromNow) : false

              return (
                <tr
                  key={batch.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  id={`batch-row-${batch.id}`}
                >
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
                      {batch.batch_number}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {batch.product ? (
                      <div>
                        <p className="font-medium text-xs">{batch.product.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{batch.product.sku}</p>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {formatDate(batch.manufacture_date)}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className={isExpired ? 'text-red-600 dark:text-red-400 font-medium' : isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-muted-foreground'}>
                      {formatDate(batch.expiration_date)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    {batch.quantity}
                  </td>
                  <td className="py-3 px-4">
                    {isExpired ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">Vencido</Badge>
                    ) : isExpiringSoon ? (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">Por vencer</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">Vigente</Badge>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      <DataTablePagination totalItems={10} />
    </div>
  )
}

export default function BatchesPage() {
  return (
    <PageShell
      registerButton={
        <Button id="create-batch-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Lote
        </Button>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <BatchesContent />
      </Suspense>
    </PageShell>
  )
}
