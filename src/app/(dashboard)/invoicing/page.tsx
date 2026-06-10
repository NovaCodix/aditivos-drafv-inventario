import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getInvoices, getInvoiceSummary } from '@/modules/invoicing/services/invoicing.service'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Facturación' }

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT:     { label: 'Borrador',   variant: 'secondary' },
  ISSUED:    { label: 'Emitida',    variant: 'default' },
  PAID:      { label: 'Pagada',     variant: 'default' },
  OVERDUE:   { label: 'Vencida',    variant: 'destructive' },
  CANCELLED: { label: 'Cancelada',  variant: 'outline' },
  VOIDED:    { label: 'Anulada',    variant: 'destructive' },
}

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}

async function InvoicingContent({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1
  const [{ data: invoices, count }, summary] = await Promise.all([
    getInvoices({ search: searchParams.search, status: searchParams.status, page, pageSize: 20 }),
    getInvoiceSummary(),
  ])

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Borradores</p>
          <p className="text-2xl font-bold">{summary.count_draft}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Emitidas</p>
          <p className="text-2xl font-bold text-blue-500">{summary.count_issued}</p>
          <p className="text-xs text-muted-foreground">S/ {summary.total_issued.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pagadas</p>
          <p className="text-2xl font-bold text-emerald-500">{summary.count_paid}</p>
          <p className="text-xs text-muted-foreground">S/ {summary.total_paid.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Vencidas</p>
          <p className="text-2xl font-bold text-destructive">S/ {summary.total_overdue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left p-3 font-semibold">Número</th>
              <th className="text-left p-3 font-semibold">Cliente</th>
              <th className="text-left p-3 font-semibold">Estado</th>
              <th className="text-left p-3 font-semibold">Emisión</th>
              <th className="text-left p-3 font-semibold">Vencimiento</th>
              <th className="text-right p-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  No hay facturas registradas
                </td>
              </tr>
            ) : invoices.map(inv => {
              const status = STATUS_LABELS[inv.status] || { label: inv.status, variant: 'outline' as const }
              return (
                <tr key={inv.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-mono font-medium text-xs">{inv.full_number}</td>
                  <td className="p-3 font-medium">{inv.customer_name}</td>
                  <td className="p-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {inv.is_overdue && <Badge variant="destructive" className="ml-1">Vencida</Badge>}
                  </td>
                  <td className="p-3 text-muted-foreground">{new Date(inv.issue_date).toLocaleDateString('es-PE')}</td>
                  <td className="p-3 text-muted-foreground">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {inv.currency} {inv.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="p-3 text-xs text-muted-foreground border-t">{count} factura{count !== 1 ? 's' : ''} en total</div>
      </div>
    </div>
  )
}

export default async function InvoicingPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground text-sm mt-1">Emisión y gestión de facturas</p>
        </div>
        <Button id="create-invoice-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Factura
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <InvoicingContent searchParams={params} />
      </Suspense>
    </div>
  )
}
