import type { Metadata } from 'next'
import { getBrands } from '@/modules/brands/services/brands.service'
import { BrandsClient } from '@/modules/brands/components/brands-client'

export const metadata: Metadata = { title: 'Marcas' }

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <BrandsClient initialBrands={brands} />
  )
}
