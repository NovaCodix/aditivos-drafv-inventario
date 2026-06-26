import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById } from '@/modules/products/services/products.service'
import { getCategories } from '@/modules/categories/services/categories.service'
import { getBrands } from '@/modules/brands/services/brands.service'
import { getUnitMeasures } from '@/modules/unit-measures/services/unit-measures.service'
import { ProductForm } from '@/modules/products/components/product-form'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Editar Producto' }

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const [product, categories, brands, unitMeasures] = await Promise.all([
    getProductById(id),
    getCategories(),
    getBrands(),
    getUnitMeasures(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <PageShell>
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-bold mb-6 text-foreground tracking-tight">Editar Producto: {product.name}</h1>
        <ProductForm
          product={product as any}
          categories={categories}
          brands={brands}
          unitMeasures={unitMeasures}
        />
      </div>
    </PageShell>
  )
}
