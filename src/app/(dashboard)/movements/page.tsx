import type { Metadata } from 'next'
import { getInventoryMovements } from '@/modules/stock-movements/services/movements.service'
import { getProductsForSelect } from '@/modules/products/services/products.service'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { getBatches } from '@/modules/batches/services/batches.service'
import { getLocations } from '@/modules/locations/services/locations.service'
import { MovementsClient } from '@/modules/stock-movements/components/movements-client'

export const metadata: Metadata = { title: 'Movimientos — Kardex' }

export default async function MovementsPage() {
  const [
    movementsRes,
    products,
    warehouses,
    batchesRes,
    locations
  ] = await Promise.all([
    getInventoryMovements({ pageSize: 100 }),
    getProductsForSelect(),
    getWarehouses(),
    getBatches({ pageSize: 500 }),
    getLocations()
  ])

  return (
    <MovementsClient
      initialMovements={movementsRes.data}
      products={products}
      warehouses={warehouses}
      batches={batchesRes.data as any}
      locations={locations as any}
    />
  )
}
