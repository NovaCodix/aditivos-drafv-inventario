import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getInvoiceById } from '@/modules/invoicing/services/invoicing.service'
import { InvoiceDetailClient } from '@/modules/invoicing/components/invoice-detail-client'

export const metadata: Metadata = { title: 'Detalle de Factura' }

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params
  const invoiceData = await getInvoiceById(id)

  if (!invoiceData) {
    notFound()
  }

  return (
    <InvoiceDetailClient
      invoice={invoiceData.invoice}
      details={invoiceData.details}
    />
  )
}
