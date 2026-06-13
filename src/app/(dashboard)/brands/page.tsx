import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getBrands } from '@/modules/brands/services/brands.service'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Marcas' }

async function BrandsContent() {
  const brands = await getBrands()

  return (
    <div className="overflow-x-auto">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nombre</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
          </tr>
        </thead>
        <tbody>
          {brands.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No hay marcas registradas</p>
              </td>
            </tr>
          ) : (
            brands.map((brand, index) => (
              <tr
                key={brand.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                id={`brand-${brand.id}`}
              >
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-medium text-sm">{brand.name}</p>
                  </div>
                </td>
                <td className="py-3 px-6 text-center">
                  <Badge variant={brand.is_active ? 'default' : 'secondary'} className="text-[10px]">
                    {brand.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      {/* Pagination */}
      <DataTablePagination totalItems={brands.length} />
    </div>
  )
}

export default function BrandsPage() {
  return (
    <PageShell
      registerButton={
        <Button id="create-brand-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Marca
        </Button>
      }
    >
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <BrandsContent />
      </Suspense>
    </PageShell>
  )
}
