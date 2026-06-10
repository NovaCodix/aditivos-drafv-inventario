import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getProducts } from '@/modules/products/services/products.service'
import { getCategories } from '@/modules/categories/services/categories.service'
import { getBrands } from '@/modules/brands/services/brands.service'
import { getUnitMeasures } from '@/modules/unit-measures/services/unit-measures.service'
import { ProductsTable } from '@/modules/products/components/products-table'
import { RequirePermission } from '@/shared/components/auth/require-permission'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Productos',
}

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string
    category_id?: string
    brand_id?: string
    page?: string
  }>
}

async function ProductsContent({ searchParams }: { searchParams: Awaited<ProductsPageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1

  const [productsResult, categories, brands, unitMeasures] = await Promise.all([
    getProducts({
      search: searchParams.search,
      category_id: searchParams.category_id,
      brand_id: searchParams.brand_id,
      is_active: true,
      page,
      pageSize: 20,
    }),
    getCategories(),
    getBrands(),
    getUnitMeasures(),
  ])

  return (
    <ProductsTable
      products={productsResult.data}
      totalCount={productsResult.count}
      categories={categories}
      brands={brands}
      unitMeasures={unitMeasures}
      currentPage={page}
    />
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestión del catálogo de aditivos de concreto
          </p>
        </div>
        <RequirePermission module="PRODUCTS" action="CREATE">
          <Button render={<Link href="/products/new" />} id="create-product-btn" className="gradient-primary text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
          </Button>
        </RequirePermission>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ProductsContent searchParams={params} />
      </Suspense>
    </div>
  )
}
