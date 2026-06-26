import type { Metadata } from 'next'
import { getBatches } from '@/modules/batches/services/batches.service'
import { getProductsForSelect } from '@/modules/products/services/products.service'
import { BatchesClient } from '@/modules/batches/components/batches-client'

export const metadata: Metadata = { title: 'Lotes' }

export default async function BatchesPage() {
  const [{ data: batches }, products] = await Promise.all([
    getBatches({ pageSize: 100 }),
    getProductsForSelect()
  ])

  return (
    <BatchesClient initialBatches={batches as any} products={products} />
  )
}
