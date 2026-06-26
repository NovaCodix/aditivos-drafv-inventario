import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSalesOrderById } from '@/modules/sales/services/sales.service'
import { getWarehouses } from '@/modules/warehouses/services/warehouses.service'
import { getBatches } from '@/modules/batches/services/batches.service'
import { SalesDetailClient } from '@/modules/sales/components/sales-detail-client'

export const metadata: Metadata = { title: 'Detalle de Orden de Venta' }

interface SalesDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SalesDetailPage({ params }: SalesDetailPageProps) {
  const { id } = await params
  const [orderData, warehouses, batchesRes] = await Promise.all([
    getSalesOrderById(id),
    getWarehouses(),
    getBatches({ pageSize: 500 })
  ])

  if (!orderData) {
    notFound()
  }

  return (
    <SalesDetailClient
      order={orderData.order}
      details={orderData.details}
      warehouses={warehouses}
      batches={batchesRes.data}
    />
  )
}
