import type { Metadata } from 'next'
import { getCustomers } from '@/modules/customers/services/customers.service'
import { getSalesOrders } from '@/modules/sales/services/sales.service'
import { getProducts } from '@/modules/products/services/products.service'
import { InvoiceForm } from '@/modules/invoicing/components/invoice-form'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Nueva Factura' }

export default async function NewInvoicePage() {
  const [customersRes, salesOrdersRes, productsRes] = await Promise.all([
    getCustomers({ pageSize: 200, is_active: true }),
    getSalesOrders({ status: 'CONFIRMED', pageSize: 200 }),
    getProducts({ pageSize: 500, is_active: true })
  ])

  return (
    <PageShell>
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-bold mb-6 text-foreground tracking-tight">Crear Factura</h1>
        <InvoiceForm
          customers={customersRes.data}
          salesOrders={salesOrdersRes.data as any}
          products={productsRes.data as any}
        />
      </div>
    </PageShell>
  )
}
