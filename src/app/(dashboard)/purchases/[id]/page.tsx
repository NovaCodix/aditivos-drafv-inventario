import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPurchaseOrderById } from '@/modules/purchases/services/purchases.service'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { getBatches } from '@/modules/batches/services/batches.service'
import { PurchaseDetailClient } from '@/modules/purchases/components/purchase-detail-client'

export const metadata: Metadata = { title: 'Detalle de Orden de Compra' }

interface PurchaseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const { id } = await params
  const [orderData, warehouses, batchesRes] = await Promise.all([
    getPurchaseOrderById(id),
    getWarehouses(),
    getBatches({ pageSize: 500 })
  ])

  if (!orderData) {
    notFound()
  }

  return (
    <PurchaseDetailClient
      order={orderData.order}
      details={orderData.details}
      warehouses={warehouses}
      batches={batchesRes.data}
    />
  )
}
