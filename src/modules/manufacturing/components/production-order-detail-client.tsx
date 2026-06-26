'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Check, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { startProductionOrderAction, completeProductionOrderAction } from '../actions/manufacturing.actions'
import type { Warehouse } from '@/shared/types/database.types'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT:       { label: 'Borrador',    variant: 'secondary' },
  IN_PROGRESS: { label: 'En proceso',  variant: 'default' },
  COMPLETED:   { label: 'Completada',  variant: 'default' },
  CANCELLED:   { label: 'Cancelada',   variant: 'destructive' },
}

interface ProductionOrderDetailClientProps {
  order: any
  consumptions: any[]
  bomItems: any[]
  warehouses: Warehouse[]
  batches: any[]
}

export function ProductionOrderDetailClient({
  order,
  consumptions,
  bomItems,
  warehouses,
  batches,
}: ProductionOrderDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(order.warehouse_id || '')
  
  const [consumedQtys, setConsumedQtys] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    consumptions.forEach(c => {
      initial[c.id] = c.quantity_planned
    })
    return initial
  })

  const [consumedBatches, setConsumedBatches] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    consumptions.forEach(c => {
      initial[c.id] = ''
    })
    return initial
  })

  const [outputQty, setOutputQty] = useState(order.quantity_planned)
  const [outputBatch, setOutputBatch] = useState('')

  const status = STATUS_LABELS[order.status] || { label: order.status, variant: 'outline' as const }

  const handleStart = () => {
    if (!confirm('¿Estás seguro de iniciar la producción de esta orden?')) return
    startTransition(async () => {
      const res = await startProductionOrderAction(order.id)
      if (res.success) {
        toast.success('Producción iniciada exitosamente')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWarehouseId) {
      toast.error('Debe seleccionar el almacén')
      return
    }

    const consList = consumptions.map(c => ({
      consumption_id: c.id,
      product_id: c.product_id,
      batch_id: consumedBatches[c.id] || null,
      quantity_consumed: consumedQtys[c.id] || 0,
      unit_cost: 0,
    }))

    const invalidCons = consList.find(c => c.quantity_consumed <= 0 || !c.batch_id)
    if (invalidCons) {
      toast.error('Por favor complete todos los componentes con cantidades válidas y seleccione su lote de origen')
      return
    }

    const outputList = [
      {
        product_id: order.product_id,
        batch_id: outputBatch || null,
        quantity_produced: outputQty,
        unit_cost: 0,
      }
    ]

    startTransition(async () => {
      const res = await completeProductionOrderAction(
        order.id,
        selectedWarehouseId,
        consList,
        outputList
      )

      if (res.success) {
        toast.success('Orden de producción completada y stock actualizado')
        setIsCompleteOpen(false)
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
            <h1 className="text-xl font-bold tracking-tight">Producto: {order.product?.name}</h1>
            <p className="text-xs text-muted-foreground">Fórmula/BOM: {order.bom?.name} v{order.bom?.version}</p>
            <p className="text-xs text-muted-foreground">Almacén: {order.warehouse?.name}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {order.status === 'DRAFT' && (
              <Button onClick={handleStart} disabled={isPending} className="gradient-primary text-white border-0">
                <Play className="w-4 h-4 mr-2" /> Iniciar Producción
              </Button>
            )}
            {order.status === 'IN_PROGRESS' && (
              <Button onClick={() => setIsCompleteOpen(true)} disabled={isPending} className="gradient-primary text-white border-0">
                <Check className="w-4 h-4 mr-2" /> Completar Producción
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/40">
              <h2 className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Componentes Planificados</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
                  <th className="py-2.5 px-4 text-left text-[11px] font-bold text-slate-600 dark:text-slate-300">Insumo</th>
                  <th className="py-2.5 px-4 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">Cantidad Planificada</th>
                  <th className="py-2.5 px-4 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">Cantidad Consumida</th>
                </tr>
              </thead>
              <tbody>
                {consumptions.map((c) => (
                  <tr key={c.id} className="border-b border-border/25 last:border-none">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-xs">{c.product?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{c.product?.sku}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs">{c.quantity_planned}</td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">{c.quantity_consumed || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-6 space-y-4 h-fit">
            <h2 className="text-sm font-bold border-b border-border/40 pb-2">Información del Lote</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cant. Planificada:</span>
                <span className="font-semibold">{order.quantity_planned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cant. Producida:</span>
                <span className="font-semibold text-emerald-600">{order.quantity_produced || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inicio Real:</span>
                <span className="font-semibold">
                  {order.actual_start ? new Date(order.actual_start).toLocaleDateString('es-PE') : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fin Real:</span>
                <span className="font-semibold">
                  {order.actual_end ? new Date(order.actual_end).toLocaleDateString('es-PE') : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Completar Producción & Consumos</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCompleteSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto px-1">
            <div className="space-y-1.5">
              <Label htmlFor="complete_warehouse_id">Almacén de Operación</Label>
              <select
                id="complete_warehouse_id"
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                required
                className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">Seleccione un almacén...</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label>Componentes Consumidos</Label>
              <div className="space-y-3 border border-border/40 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/30">
                {consumptions.map((c) => {
                  const productBatches = batches.filter(b => b.product_id === c.product_id)

                  return (
                    <div key={c.id} className="space-y-2 border-b border-border/20 last:border-none pb-2 last:pb-0">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{c.product?.name}</span>
                        <span className="text-muted-foreground">Planificado: {c.quantity_planned}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Cantidad Real Consumida</Label>
                          <Input
                            type="number"
                            step="0.0001"
                            min={0.0001}
                            value={consumedQtys[c.id] ?? 0}
                            onChange={(e) => setConsumedQtys({ ...consumedQtys, [c.id]: Number(e.target.value) || 0 })}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px]">Lote de Origen</Label>
                          <select
                            value={consumedBatches[c.id] ?? ''}
                            onChange={(e) => setConsumedBatches({ ...consumedBatches, [c.id]: e.target.value })}
                            required
                            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                          >
                            <option value="">Seleccione lote...</option>
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

            <div className="space-y-3 border-t border-border/40 pt-3">
              <Label>Información de Salida (Output)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="outputQty">Cantidad Real Producida</Label>
                  <Input
                    id="outputQty"
                    type="number"
                    min={1}
                    value={outputQty}
                    onChange={(e) => setOutputQty(Number(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="outputBatch">Asignar Lote Producido (Opcional)</Label>
                  <select
                    id="outputBatch"
                    value={outputBatch}
                    onChange={(e) => setOutputBatch(e.target.value)}
                    className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Crear nuevo lote automático...</option>
                    {batches.filter(b => b.product_id === order.product_id).map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batch_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCompleteOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                Confirmar Finalización
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
