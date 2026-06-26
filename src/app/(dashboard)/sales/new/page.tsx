import type { Metadata } from 'next'
import { getCustomers } from '@/modules/customers/services/customers.service'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { getProductsForSelect } from '@/modules/products/services/products.service'
import { SalesForm } from '@/modules/sales/components/sales-form'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Nueva Orden de Venta' }

export default async function NewSalesPage() {
  const [customersRes, warehouses, products] = await Promise.all([
    getCustomers({ pageSize: 200, is_active: true }),
    getWarehouses(),
    getProductsForSelect()
  ])

  return (
    <PageShell>
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-bold mb-6 text-foreground tracking-tight">Crear Orden de Venta</h1>
        <SalesForm
          customers={customersRes.data}
          warehouses={warehouses}
          products={products}
        />
      </div>
    </PageShell>
  )
}
