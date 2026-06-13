import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, ArrowDown, ArrowUp, ArrowLeftRight, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getInventoryMovements } from '@/modules/stock-movements/services/movements.service'
import { formatDateTime } from '@/shared/lib/utils'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Movimientos — Kardex' }

const movementIcons = {
  ENTRY:        { icon: ArrowDown,      color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',   label: 'Entrada'   },
  EXIT:         { icon: ArrowUp,        color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',       label: 'Salida'    },
  TRANSFER_IN:  { icon: ArrowDown,      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',     label: 'T. Entrada'},
  TRANSFER_OUT: { icon: ArrowUp,        color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'T. Salida' },
  ADJUSTMENT:   { icon: Sliders,        color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Ajuste'    },
}

async function MovementsContent() {
  const { data: movements } = await getInventoryMovements({ pageSize: 50 })

  return (
    <div className="overflow-x-auto">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Tipo</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Producto</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Almacén</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Lote</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Cantidad</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Stock Antes</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Stock Después</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Notas</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-16 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <ArrowLeftRight className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No hay movimientos registrados</p>
                  <p className="text-xs opacity-60">Registra una entrada de inventario para comenzar</p>
                </div>
              </td>
            </tr>
          ) : (
            movements.map((movement, index) => {
              const config = movementIcons[movement.movement_type as keyof typeof movementIcons]
              const Icon = config?.icon || ArrowLeftRight
              return (
                <tr
                  key={movement.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  id={`movement-row-${movement.id}`}
                >
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config?.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${config?.color}`} />
                      </div>
                      <span className="text-xs font-medium">{config?.label}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {movement.product ? (
                      <div>
                        <p className="font-medium text-xs">{movement.product.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{movement.product.sku}</p>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">{movement.product_id.substring(0, 8)}...</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {movement.warehouse?.name || '—'}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                    {movement.batch?.batch_number || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono font-bold text-sm ${
                      ['ENTRY', 'TRANSFER_IN'].includes(movement.movement_type)
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {['ENTRY', 'TRANSFER_IN'].includes(movement.movement_type) ? '+' : '-'}{movement.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {movement.stock_before}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs font-semibold hidden md:table-cell">
                    {movement.stock_after}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground max-w-32 truncate">
                    {movement.notes || '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(movement.created_at)}
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

export default function MovementsPage() {
  return (
    <PageShell
      registerButton={
        <Button id="new-movement-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Movimiento
        </Button>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <MovementsContent />
      </Suspense>
    </PageShell>
  )
}
