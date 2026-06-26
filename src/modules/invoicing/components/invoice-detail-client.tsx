'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, FileText, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { issueInvoiceAction, markInvoicePaidAction, voidInvoiceAction } from '../actions/invoicing.actions'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT:     { label: 'Borrador',   variant: 'secondary' },
  ISSUED:    { label: 'Emitida',    variant: 'default' },
  PAID:      { label: 'Pagada',     variant: 'default' },
  OVERDUE:   { label: 'Vencida',    variant: 'destructive' },
  CANCELLED: { label: 'Cancelada',  variant: 'outline' },
  VOIDED:    { label: 'Anulada',    variant: 'destructive' },
}

interface InvoiceDetailClientProps {
  invoice: any
  details: any[]
}

export function InvoiceDetailClient({ invoice, details }: InvoiceDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const status = STATUS_LABELS[invoice.status] || { label: invoice.status, variant: 'outline' as const }

  const handleIssue = () => {
    if (!confirm('¿Estás seguro de emitir esta factura?')) return
    startTransition(async () => {
      const res = await issueInvoiceAction(invoice.id)
      if (res.success) {
        toast.success('Factura emitida exitosamente')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handlePay = () => {
    if (!confirm('¿Estás seguro de marcar esta factura como pagada?')) return
    startTransition(async () => {
      const res = await markInvoicePaidAction(invoice.id)
      if (res.success) {
        toast.success('Factura marcada como pagada')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleVoid = () => {
    if (!confirm('¿Estás seguro de anular esta factura?')) return
    startTransition(async () => {
      const res = await voidInvoiceAction(invoice.id)
      if (res.success) {
        toast.success('Factura anulada')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-muted-foreground">{invoice.invoice_series}-{invoice.invoice_number}</span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{invoice.customer?.business_name}</h1>
            <p className="text-xs text-muted-foreground">RUC: {invoice.customer?.ruc}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {invoice.status === 'DRAFT' && (
              <>
                <Button variant="outline" onClick={handleVoid} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  <X className="w-4 h-4 mr-2" /> Anular
                </Button>
                <Button onClick={handleIssue} disabled={isPending} className="gradient-primary text-white border-0">
                  <Check className="w-4 h-4 mr-2" /> Emitir Factura
                </Button>
              </>
            )}
            {invoice.status === 'ISSUED' && (
              <>
                <Button variant="outline" onClick={handleVoid} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  <X className="w-4 h-4 mr-2" /> Anular
                </Button>
                <Button onClick={handlePay} disabled={isPending} className="gradient-primary text-white border-0">
                  <Landmark className="w-4 h-4 mr-2" /> Registrar Pago
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Detalles de Factura</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
                <th className="py-2.5 px-4 text-left text-[11px] font-bold text-slate-600 dark:text-slate-300">Descripción / Concepto</th>
                <th className="py-2.5 px-4 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">Cantidad</th>
                <th className="py-2.5 px-4 text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">Precio Unit.</th>
                <th className="py-2.5 px-4 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">Descuento</th>
                <th className="py-2.5 px-4 text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d) => (
                <tr key={d.id} className="border-b border-border/25 last:border-none">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-xs">{d.description}</p>
                    {d.product && <p className="text-[10px] text-muted-foreground font-mono">{d.product.sku}</p>}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs">{d.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono text-xs">{invoice.currency} {d.unit_price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center text-xs text-muted-foreground">{d.discount_pct}%</td>
                  <td className="py-3 px-4 text-right font-mono text-xs font-semibold">{invoice.currency} {d.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 bg-[#F8FAFC] dark:bg-slate-900/50 flex flex-col items-end gap-1.5 border-t border-border/40 text-xs">
            <div className="flex justify-between w-48 text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono">{invoice.currency} {invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-muted-foreground">
              <span>IGV ({invoice.tax_rate}%):</span>
              <span className="font-mono">{invoice.currency} {invoice.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-sm font-bold text-foreground border-t border-border/40 pt-1.5 mt-1.5">
              <span>Total:</span>
              <span className="font-mono">{invoice.currency} {invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
