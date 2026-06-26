import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductionOrderById, getBomById } from '@/modules/manufacturing/services/manufacturing.service'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { getBatches } from '@/modules/batches/services/batches.service'
import { ProductionOrderDetailClient } from '@/modules/manufacturing/components/production-order-detail-client'

export const metadata: Metadata = { title: 'Detalle de Orden de Producción' }

interface ProductionOrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductionOrderDetailPage({ params }: ProductionOrderDetailPageProps) {
  const { id } = await params
  const [orderData, warehouses, batchesRes] = await Promise.all([
    getProductionOrderById(id),
    getWarehouses(),
    getBatches({ pageSize: 500 })
  ])

  if (!orderData) {
    notFound()
  }

  const bomData = await getBomById(orderData.order.bom_id)

  return (
    <ProductionOrderDetailClient
      order={orderData.order}
      consumptions={orderData.consumptions}
      bomItems={bomData?.items || []}
      warehouses={warehouses}
      batches={batchesRes.data}
    />
  )
}
