import type { Metadata } from 'next'
import { getCustomers } from '@/modules/customers/services/customers.service'
import { CustomersClient } from '@/modules/customers/components/customers-client'

export const metadata: Metadata = { title: 'Clientes' }

export default async function CustomersPage() {
  const { data: customers } = await getCustomers({ pageSize: 100 })

  return (
    <CustomersClient initialCustomers={customers} />
  )
}
