import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getLocations } from '@/modules/locations/services/locations.service'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Ubicaciones' }

async function LocationsContent() {
  const locations = await getLocations()

  return (
    <Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden !p-0 gap-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Código</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Almacén</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Pasillo</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estante</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nivel</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Descripción</th>
                <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-10 h-10 opacity-20 mx-auto mb-2" />
                    <p className="text-sm">No hay ubicaciones registradas</p>
                  </td>
                </tr>
              ) : (
                locations.map(loc => (
                  <tr key={loc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors" id={`location-row-${loc.id}`}>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded inline-block">
                        {loc.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-center">{loc.warehouse?.name || '—'}</td>
                    <td className="py-3 px-4 text-xs text-center">{loc.aisle || '—'}</td>
                    <td className="py-3 px-4 text-xs text-center">{loc.rack || '—'}</td>
                    <td className="py-3 px-4 text-xs text-center">{loc.level || '—'}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground text-center">{loc.description || '—'}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={loc.is_active ? 'default' : 'secondary'} className="text-xs inline-flex justify-center">
                        {loc.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      
        {/* Pagination */}
        <DataTablePagination totalItems={10} />
      </CardContent>
    </Card>
  )
}

export default function LocationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ubicaciones</h1>
          <p className="text-muted-foreground text-sm mt-1">Ubicaciones dentro de almacenes (pasillos, estantes, niveles)</p>
        </div>
        <Button id="create-location-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Ubicación
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
        <LocationsContent />
      </Suspense>
    </div>
  )
}
