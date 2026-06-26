import type { Metadata } from 'next'
import { getCategories } from '@/modules/categories/services/categories.service'
import { getBrands } from '@/modules/brands/services/brands.service'
import { getUnitMeasures } from '@/modules/unit-measures/services/unit-measures.service'
import { ProductForm } from '@/modules/products/components/product-form'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Nuevo Producto' }

export default async function NewProductPage() {
  const [categories, brands, unitMeasures] = await Promise.all([
    getCategories(),
    getBrands(),
    getUnitMeasures(),
  ])

  return (
    <PageShell>
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-bold mb-6 text-foreground tracking-tight">Crear Nuevo Producto</h1>
        <ProductForm
          categories={categories}
          brands={brands}
          unitMeasures={unitMeasures}
        />
      </div>
    </PageShell>
  )
}
