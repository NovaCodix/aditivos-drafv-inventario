import type { Metadata } from 'next'
import { getSuppliers } from '@/modules/suppliers/services/suppliers.service'
import { getProductsForSelect } from '@/modules/products/services/products.service'
import { PurchaseForm } from '@/modules/purchases/components/purchase-form'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Nueva Orden de Compra' }

export default async function NewPurchasePage() {
  const [suppliersRes, products] = await Promise.all([
    getSuppliers({ pageSize: 200, is_active: true }),
    getProductsForSelect()
  ])

  return (
    <PageShell>
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-bold mb-6 text-foreground tracking-tight">Crear Orden de Compra</h1>
        <PurchaseForm
          suppliers={suppliersRes.data}
          products={products}
        />
      </div>
    </PageShell>
  )
}
