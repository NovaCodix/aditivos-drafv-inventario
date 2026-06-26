'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, FileText, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { processSalesOrderAction, cancelSalesOrderAction, createDeliveryAction } from '../actions/sales.actions'
import type { Warehouse } from '@/shared/types/database.types'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  CONFIRMED:  { label: 'Confirmada',  variant: 'default' },
  PROCESSING: { label: 'En proceso',  variant: 'secondary' },
  PARTIAL:    { label: 'Parcial',     variant: 'outline' },
  DELIVERED:  { label: 'Entregada',   variant: 'default' },
  CANCELLED:  { label: 'Cancelada',   variant: 'destructive' },
}

interface SalesDetailClientProps {
  order: any
  details: any[]
  warehouses: Warehouse[]
  batches: any[]
}

export function SalesDetailClient({ order, details, warehouses, batches }: SalesDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false)
  const [deliveryNotes, setDeliveryNotes] = useState('')
  
  const [deliveryQtys, setDeliveryQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    details.forEach(d => {
      initial[d.id] = Math.max(0, d.quantity_ordered - d.quantity_delivered)
    })
    return initial
  })

  const [deliveryBatches, setDeliveryBatches] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    details.forEach(d => {
      initial[d.id] = ''
    })
    return initial
  })

  const status = STATUS_LABELS[order.status] || { label: order.status, variant: 'outline' as const }

  const handleProcess = () => {
    if (!confirm('¿Estás seguro de procesar esta orden de venta?')) return
    startTransition(async () => {
      const res = await processSalesOrderAction(order.id)
      if (res.success) {
        toast.success('Orden de venta en proceso de despacho')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleCancel = () => {
    if (!confirm('¿Estás seguro de cancelar esta orden de venta?')) return
    startTransition(async () => {
      const res = await cancelSalesOrderAction(order.id)
      if (res.success) {
        toast.success('Orden de venta cancelada')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const items = details.map(d => ({
      sales_order_detail_id: d.id,
      product_id: d.product_id,
      batch_id: deliveryBatches[d.id] || null,
      quantity_delivered: deliveryQtys[d.id] || 0,
      unit_price: d.unit_price,
    })).filter(item => item.quantity_delivered > 0)

    if (items.length === 0) {
      toast.error('Debe ingresar cantidad a entregar mayor a cero en al menos un ítem')
      return
    }

    startTransition(async () => {
      const res = await createDeliveryAction(
        order.id,
        order.warehouse_id,
        items,
        deliveryNotes || undefined
      )

      if (res.success) {
        toast.success('Entrega / Despacho registrado exitosamente')
        setIsDeliveryOpen(false)
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
              <span className="font-mono text-sm font-semibold text-muted-foreground">{order.code}</span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{order.customer?.business_name}</h1>
            <p className="text-xs text-muted-foreground">RUC: {order.customer?.ruc}</p>
            <p className="text-xs text-muted-foreground">Almacén Origen: {order.warehouse?.name}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {order.status === 'CONFIRMED' && (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button onClick={handleProcess} disabled={isPending} className="gradient-primary text-white border-0">
                  <Check className="w-4 h-4 mr-2" /> Procesar Despacho
                </Button>
              </>
            )}
            {order.status === 'PROCESSING' && (
              <Button onClick={() => setIsDeliveryOpen(true)} disabled={isPending} className="gradient-primary text-white border-0">
                <Truck className="w-4 h-4 mr-2" /> Registrar Despacho / Entrega
              </Button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Detalles de la Orden</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
                <th className="py-2.5 px-4 text-left text-[11px] font-bold text-slate-600 dark:text-slate-300">Producto</th>
                <th className="py-2.5 px-4 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">Cant. Pedida</th>
                <th className="py-2.5 px-4 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">Cant. Entregada</th>
                <th className="py-2.5 px-4 text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">Precio Unit.</th>
                <th className="py-2.5 px-4 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">Descuento</th>
                <th className="py-2.5 px-4 text-right text-[11px] font-bold text-slate-600 dark:text-slate-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d) => (
                <tr key={d.id} className="border-b border-border/25 last:border-none">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-xs">{d.product?.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{d.product?.sku}</p>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs">{d.quantity_ordered} {d.product?.unit_measure?.abbreviation}</td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">{d.quantity_delivered} {d.product?.unit_measure?.abbreviation}</td>
                  <td className="py-3 px-4 text-right font-mono text-xs">{order.currency} {d.unit_price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center text-xs text-muted-foreground">{d.discount_pct}%</td>
                  <td className="py-3 px-4 text-right font-mono text-xs font-semibold">{order.currency} {d.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 bg-[#F8FAFC] dark:bg-slate-900/50 flex flex-col items-end gap-1.5 border-t border-border/40 text-xs">
            <div className="flex justify-between w-48 text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono">{order.currency} {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-muted-foreground">
              <span>IGV ({order.tax_rate}%):</span>
              <span className="font-mono">{order.currency} {order.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-sm font-bold text-foreground border-t border-border/40 pt-1.5 mt-1.5">
              <span>Total:</span>
              <span className="font-mono">{order.currency} {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeliveryOpen} onOpenChange={setIsDeliveryOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar Despacho / Entrega</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeliverySubmit} className="space-y-4 max-h-[85vh] overflow-y-auto px-1">
            <div className="space-y-3">
              <Label>Ítems a Entregar</Label>
              <div className="space-y-3 border border-border/40 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/30">
                {details.map((d) => {
                  const pending = d.quantity_ordered - d.quantity_delivered
                  if (pending <= 0) return null
                  const productBatches = batches.filter(b => b.product_id === d.product_id)

                  return (
                    <div key={d.id} className="space-y-2 border-b border-border/20 last:border-none pb-2 last:pb-0">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{d.product?.name}</span>
                        <span className="text-muted-foreground">Pendiente: {pending} {d.product?.unit_measure?.abbreviation}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Cantidad Despachada</Label>
                          <Input
                            type="number"
                            min={0}
                            max={pending}
                            value={deliveryQtys[d.id] ?? 0}
                            onChange={(e) => setDeliveryQtys({ ...deliveryQtys, [d.id]: Number(e.target.value) || 0 })}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px]">Lote de Salida</Label>
                          <select
                            value={deliveryBatches[d.id] ?? ''}
                            onChange={(e) => setDeliveryBatches({ ...deliveryBatches, [d.id]: e.target.value })}
                            required
                            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                          >
                            <option value="">Seleccione un lote...</option>
                            {productBatches.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.batch_number}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="delivery_notes">Notas de Despacho</Label>
              <Textarea
                id="delivery_notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Observaciones de despacho o datos de guía de remisión..."
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDeliveryOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                Confirmar Despacho
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
