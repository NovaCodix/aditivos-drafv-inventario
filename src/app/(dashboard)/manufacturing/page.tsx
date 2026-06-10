import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Factory } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getBillsOfMaterials } from '@/modules/manufacturing/services/manufacturing.service'

export const metadata: Metadata = { title: 'Manufactura' }

async function ManufacturingContent() {
  const { data: boms, count } = await getBillsOfMaterials({ is_active: true })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {boms.length === 0 ? (
        <div className="col-span-2 text-center py-16 text-muted-foreground border rounded-xl">
          No hay listas de materiales activas
        </div>
      ) : boms.map(bom => (
        <div key={bom.id} className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold">{bom.name}</h3>
              <p className="text-xs text-muted-foreground">v{bom.version} · {bom.product?.name}</p>
            </div>
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {bom.product?.sku}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Output: {bom.output_quantity} {bom.unit_measure?.abbreviation || 'und'}
          </p>
        </div>
      ))}
    </div>
  )
}

export default async function ManufacturingPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manufactura</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Listas de materiales y órdenes de producción
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <a href="/bill-of-materials" className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer">
          <p className="text-sm font-medium text-muted-foreground">Listas de Materiales</p>
          <p className="text-2xl font-bold mt-1">BOM</p>
          <p className="text-xs text-muted-foreground mt-1">Fórmulas y componentes</p>
        </a>
        <a href="/production-orders" className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer">
          <p className="text-sm font-medium text-muted-foreground">Órdenes de Producción</p>
          <p className="text-2xl font-bold mt-1">OP</p>
          <p className="text-xs text-muted-foreground mt-1">Ejecución y seguimiento</p>
        </a>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Estado</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">Activo</p>
          <p className="text-xs text-muted-foreground mt-1">Sistema de producción</p>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <ManufacturingContent />
      </Suspense>
    </div>
  )
}
