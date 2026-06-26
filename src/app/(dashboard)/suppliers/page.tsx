import type { Metadata } from 'next'
import { getSuppliers } from '@/modules/suppliers/services/suppliers.service'
import { SuppliersClient } from '@/modules/suppliers/components/suppliers-client'

export const metadata: Metadata = { title: 'Proveedores' }

export default async function SuppliersPage() {
  const { data: suppliers } = await getSuppliers({ pageSize: 100 })

  return (
    <SuppliersClient initialSuppliers={suppliers} />
  )
}
