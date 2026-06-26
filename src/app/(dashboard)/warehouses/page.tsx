import type { Metadata } from 'next'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { WarehousesClient } from '@/modules/warehouses/components/warehouses-client'

export const metadata: Metadata = { title: 'Almacenes' }

export default async function WarehousesPage() {
  const warehouses = await getWarehouses()

  return (
    <WarehousesClient initialWarehouses={warehouses} />
  )
}
