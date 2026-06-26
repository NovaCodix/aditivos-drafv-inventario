import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getInvoices, getInvoiceSummary } from '@/modules/invoicing/services/invoicing.service'
import { Badge } from '@/components/ui/badge'
import { PageShell } from '@/shared/components/layout/page-shell'
import Link from 'next/link'

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
      <div className="px-4 md:px-6 pt-5 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">Borradores</p>
          <p className="text-2xl font-bold">{summary.count_draft}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">Emitidas</p>
          <p className="text-2xl font-bold text-blue-500">{summary.count_issued}</p>
          <p className="text-xs text-muted-foreground">S/ {summary.total_issued.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">Pagadas</p>
          <p className="text-2xl font-bold text-emerald-500">{summary.count_paid}</p>
          <p className="text-xs text-muted-foreground">S/ {summary.total_paid.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-xs text-muted-foreground">Vencidas</p>
          <p className="text-2xl font-bold text-destructive">S/ {summary.total_overdue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Table */}
      <div className="w-full min-w-0 flex flex-col">
        <div className="px-4 md:px-6 pt-2 pb-4">
        <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Número</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Cliente</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Emisión</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Vencimiento</th>
              <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-muted-foreground">
                  <FileText className="w-10 h-10 opacity-20 mx-auto mb-2" />
                  <p className="text-sm">No hay facturas registradas</p>
                </td>
              </tr>
            ) : invoices.map((inv, index) => {
              const status = STATUS_LABELS[inv.status] || { label: inv.status, variant: 'outline' as const }
              return (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                  <td className="py-3 px-6 font-mono font-medium text-xs">
                    <Link href={`/invoicing/${inv.id}`} className="text-primary hover:underline font-semibold">
                      {inv.full_number}
                    </Link>
                  </td>
                  <td className="py-3 px-6 font-medium text-sm">{inv.customer_name}</td>
                  <td className="py-3 px-6 text-center">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {inv.is_overdue && <Badge variant="destructive" className="ml-1">Vencida</Badge>}
                  </td>
                  <td className="py-3 px-6 text-muted-foreground text-xs text-center">{new Date(inv.issue_date).toLocaleDateString('es-PE')}</td>
                  <td className="py-3 px-6 text-muted-foreground text-xs text-center">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-sm">
                    {inv.currency} {inv.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
        <DataTablePagination totalItems={count} />
      </div>
    </div>
  )
}

export default async function InvoicingPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <PageShell
      registerButton={
        <Button render={<Link href="/invoicing/new" />} id="create-invoice-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nueva Factura
        </Button>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <InvoicingContent searchParams={params} />
      </Suspense>
    </PageShell>
  )
}
