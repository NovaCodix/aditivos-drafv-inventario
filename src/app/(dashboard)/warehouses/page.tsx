import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Almacenes' }

async function WarehousesContent() {
  const warehouses = await getWarehouses()

  return (
    <div className="overflow-x-auto">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nombre</th>
            <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Descripción</th>
            <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Dirección</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No hay almacenes registrados</p>
              </td>
            </tr>
          ) : (
            warehouses.map((warehouse, index) => (
              <tr
                key={warehouse.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                id={`warehouse-${warehouse.id}`}
              >
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
                      <WarehouseIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm">{warehouse.name}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-xs text-muted-foreground">
                  {warehouse.description || '—'}
                </td>
                <td className="py-3 px-6 text-xs text-muted-foreground">
                  {warehouse.address ? `📍 ${warehouse.address}` : '—'}
                </td>
                <td className="py-3 px-6 text-center">
                  <Badge variant={warehouse.is_active ? 'default' : 'secondary'} className="text-xs">
                    {warehouse.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" render={<a href={`/locations?warehouse_id=${warehouse.id}`} id={`warehouse-locations-${warehouse.id}`} />}>
                        Ver Ubicaciones
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" render={<a href={`/warehouses/${warehouse.id}/edit`} id={`edit-warehouse-${warehouse.id}`} />}>
                        Editar
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      {/* Pagination */}
      <DataTablePagination totalItems={warehouses.length} />
    </div>
  )
}

export default function WarehousesPage() {
  return (
    <PageShell
      registerButton={
        <Button id="create-warehouse-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Almacén
        </Button>
      }
    >
      <Suspense fallback={
        <div className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      }>
        <WarehousesContent />
      </Suspense>
    </PageShell>
  )
}
