import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getUnitMeasures } from '@/modules/unit-measures/services/unit-measures.service'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Unidades de Medida' }

export default async function UnitMeasuresPage() {
  const unitMeasures = await getUnitMeasures()

  return (
    <PageShell
      registerButton={
        <Button id="create-unit-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Unidad
        </Button>
      }
    >
      <div className="w-full min-w-0 flex flex-col">
        <div className="px-4 md:px-6 pt-2 pb-4">
        <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">
          <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Abreviatura</th>
              <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nombre</th>
              <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Descripción</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
            </tr>
          </thead>
          <tbody>
            {unitMeasures.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  No hay unidades de medida registradas
                </td>
              </tr>
            ) : (
              unitMeasures.map((um, index) => (
                <tr
                  key={um.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  id={`unit-${um.id}`}
                >
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                  <td className="py-3 px-6 text-center">
                    <span className="font-mono text-base font-bold text-primary">{um.abbreviation}</span>
                  </td>
                  <td className="py-3 px-6 font-medium text-sm">{um.name}</td>
                  <td className="py-3 px-6 text-xs text-muted-foreground">
                    {um.description || '—'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <Badge variant={um.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {um.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      {/* Pagination */}
      <DataTablePagination totalItems={unitMeasures.length} />
    </div>
    </PageShell>
  )
}
