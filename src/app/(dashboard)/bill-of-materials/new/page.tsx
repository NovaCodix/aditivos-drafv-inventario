import type { Metadata } from 'next'
import { getProductsForSelect } from '@/modules/products/services/products.service'
import { getUnitMeasures } from '@/modules/unit-measures/services/unit-measures.service'
import { BomForm } from '@/modules/manufacturing/components/bom-form'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Nueva Lista de Materiales' }

export default async function NewBomPage() {
  const [products, unitMeasures] = await Promise.all([
    getProductsForSelect(),
    getUnitMeasures()
  ])

  return (
    <PageShell>
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-bold mb-6 text-foreground tracking-tight">Crear Lista de Materiales (BOM)</h1>
        <BomForm
          products={products as any}
          unitMeasures={unitMeasures}
        />
      </div>
    </PageShell>
  )
}
