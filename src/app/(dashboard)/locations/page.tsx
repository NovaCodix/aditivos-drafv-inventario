import type { Metadata } from 'next'
import { getLocations } from '@/modules/locations/services/locations.service'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { LocationsClient } from '@/modules/locations/components/locations-client'

export const metadata: Metadata = { title: 'Ubicaciones' }

export default async function LocationsPage() {
  const [locations, warehouses] = await Promise.all([
    getLocations(),
    getWarehouses()
  ])

  return (
    <LocationsClient initialLocations={locations as any} warehouses={warehouses} />
  )
}
