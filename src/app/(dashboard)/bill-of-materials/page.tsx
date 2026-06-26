import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getBillsOfMaterials } from '@/modules/manufacturing/services/manufacturing.service'
import { PageShell } from '@/shared/components/layout/page-shell'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Listas de Materiales' }

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

async function BomContent({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1
  const { data: boms, count } = await getBillsOfMaterials({ page, pageSize: 20 })

  return (
    <div className="w-full min-w-0 flex flex-col">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">
          <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nombre</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Producto</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">SKU</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Versión</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Output</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
          </tr>
        </thead>
        <tbody>
          {boms.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-muted-foreground">
                <ClipboardList className="w-10 h-10 opacity-20 mx-auto mb-2" />
                <p className="text-sm">No hay listas de materiales registradas</p>
              </td>
            </tr>
          ) : boms.map((bom, index) => (
            <tr key={bom.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
              <td className="py-3 px-6 font-medium text-sm">{bom.name}</td>
              <td className="py-3 px-6 text-sm">{bom.product?.name || '—'}</td>
              <td className="py-3 px-6 font-mono text-xs text-muted-foreground">{bom.product?.sku || '—'}</td>
              <td className="py-3 px-6 text-muted-foreground text-xs text-center">v{bom.version}</td>
              <td className="py-3 px-6 text-center text-sm">{bom.output_quantity} {bom.unit_measure?.abbreviation || 'und'}</td>
              <td className="py-3 px-6 text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bom.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                  {bom.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      </div>
      <DataTablePagination totalItems={count} />
    </div>
  )
}

export default async function BillOfMaterialsPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <PageShell
      registerButton={
        <Button render={<Link href="/bill-of-materials/new" />} id="create-bom-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Lista
        </Button>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <BomContent searchParams={params} />
      </Suspense>
    </PageShell>
  )
}
