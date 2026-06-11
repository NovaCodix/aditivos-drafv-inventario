import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getBillsOfMaterials } from '@/modules/manufacturing/services/manufacturing.service'

export const metadata: Metadata = { title: 'Listas de Materiales' }

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

async function BomContent({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1
  const { data: boms, count } = await getBillsOfMaterials({ page, pageSize: 20 })

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center p-3 font-semibold">Nombre</th>
            <th className="text-center p-3 font-semibold">Producto</th>
            <th className="text-center p-3 font-semibold">SKU</th>
            <th className="text-center p-3 font-semibold">Versión</th>
            <th className="text-center p-3 font-semibold">Output</th>
            <th className="text-center p-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {boms.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground">
                No hay listas de materiales registradas
              </td>
            </tr>
          ) : boms.map(bom => (
            <tr key={bom.id} className="border-b hover:bg-muted/20 transition-colors">
              <td className="p-3 font-medium">{bom.name}</td>
              <td className="p-3">{bom.product?.name || '—'}</td>
              <td className="p-3 font-mono text-xs text-muted-foreground">{bom.product?.sku || '—'}</td>
              <td className="p-3 text-muted-foreground">v{bom.version}</td>
              <td className="p-3">{bom.output_quantity} {bom.unit_measure?.abbreviation || 'und'}</td>
              <td className="p-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bom.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                  {bom.is_active ? 'Activa' : 'Inactiva'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DataTablePagination totalItems={count} />
    </div>
  )
}

export default async function BillOfMaterialsPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listas de Materiales</h1>
          <p className="text-muted-foreground text-sm mt-1">Fórmulas y componentes para producción</p>
        </div>
        <Button id="create-bom-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Lista
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <BomContent searchParams={params} />
      </Suspense>
    </div>
  )
}
