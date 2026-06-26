'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createProductionOrderAction } from '../actions/manufacturing.actions'
import type { Warehouse } from '@/shared/types/database.types'

interface BomOption {
  id: string
  name: string
  version: string
  product?: { name: string; sku: string } | null
}

interface ProductionOrderFormProps {
  boms: BomOption[]
  warehouses: Warehouse[]
}

export function ProductionOrderForm({ boms, warehouses }: ProductionOrderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [bomId, setBomId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [quantityPlanned, setQuantityPlanned] = useState(1)
  const [plannedStart, setPlannedStart] = useState('')
  const [plannedEnd, setPlannedEnd] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bomId) {
      toast.error('Debe seleccionar una lista de materiales (BOM)')
      return
    }
    if (!warehouseId) {
      toast.error('Debe seleccionar un almacén')
      return
    }
    if (quantityPlanned <= 0) {
      toast.error('La cantidad planificada debe ser mayor a 0')
      return
    }

    startTransition(async () => {
      const res = await createProductionOrderAction({
        bom_id: bomId,
        warehouse_id: warehouseId,
        quantity_planned: quantityPlanned,
        planned_start: plannedStart || undefined,
        planned_end: plannedEnd || undefined,
        notes: notes || undefined,
      })

      if (res.success) {
        toast.success('Orden de producción creada exitosamente')
        router.push('/production-orders')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="bom_id">Fórmula / BOM</Label>
          <select
            id="bom_id"
            value={bomId}
            onChange={(e) => setBomId(e.target.value)}
            required
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Seleccione una fórmula...</option>
            {boms.map(bom => (
              <option key={bom.id} value={bom.id}>
                {bom.name} (v{bom.version}) — {bom.product?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="warehouse_id">Almacén de Entrada/Salida</Label>
          <select
            id="warehouse_id"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="quantity_planned">Cantidad a Producir</Label>
          <Input
            id="quantity_planned"
            type="number"
            min={1}
            value={quantityPlanned}
            onChange={(e) => setQuantityPlanned(Number(e.target.value) || 1)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="planned_start">Inicio Planificado</Label>
          <Input
            id="planned_start"
            type="datetime-local"
            value={plannedStart}
            onChange={(e) => setPlannedStart(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="planned_end">Fin Planificado</Label>
          <Input
            id="planned_end"
            type="datetime-local"
            value={plannedEnd}
            onChange={(e) => setPlannedEnd(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas / Observaciones</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Comentarios adicionales o requisitos especiales para la fabricación..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/production-orders')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gradient-primary text-white border-0"
        >
          <Save className="w-4 h-4 mr-2" /> Crear Orden
        </Button>
      </div>
    </form>
  )
}
