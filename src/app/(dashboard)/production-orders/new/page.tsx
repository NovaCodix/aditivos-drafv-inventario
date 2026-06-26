import type { Metadata } from 'next'
import { getBillsOfMaterials } from '@/modules/manufacturing/services/manufacturing.service'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { ProductionOrderForm } from '@/modules/manufacturing/components/production-order-form'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Nueva Orden de Producción' }

export default async function NewProductionOrderPage() {
  const [bomsRes, warehouses] = await Promise.all([
    getBillsOfMaterials({ is_active: true, pageSize: 200 }),
    getWarehouses()
  ])

  return (
    <PageShell>
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-bold mb-6 text-foreground tracking-tight">Crear Orden de Producción</h1>
        <ProductionOrderForm
          boms={bomsRes.data}
          warehouses={warehouses}
        />
      </div>
    </PageShell>
  )
}
