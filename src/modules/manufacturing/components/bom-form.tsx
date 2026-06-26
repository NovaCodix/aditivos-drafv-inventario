'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createBomAction } from '../actions/manufacturing.actions'
import type { Product, UnitMeasure } from '@/shared/types/database.types'

interface BomFormProps {
  products: Product[]
  unitMeasures: UnitMeasure[]
}

interface ComponentRow {
  product_id: string
  quantity: number
  unit_measure_id: string
  scrap_pct: number
}

export function BomForm({ products, unitMeasures }: BomFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [productId, setProductId] = useState('')
  const [name, setName] = useState('')
  const [version, setVersion] = useState('1.0')
  const [outputQuantity, setOutputQuantity] = useState(1)
  const [unitMeasureId, setUnitMeasureId] = useState('')
  const [notes, setNotes] = useState('')
  
  const [items, setItems] = useState<ComponentRow[]>([
    { product_id: '', quantity: 1, unit_measure_id: '', scrap_pct: 0 }
  ])

  const handleAddRow = () => {
    setItems([...items, { product_id: '', quantity: 1, unit_measure_id: '', scrap_pct: 0 }])
  }

  const handleRemoveRow = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleRowChange = (index: number, field: keyof ComponentRow, value: string | number) => {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      [field]: field === 'product_id' || field === 'unit_measure_id' ? value : Number(value) || 0
    }
    setItems(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) {
      toast.error('Debe seleccionar el producto a producir')
      return
    }
    if (!name) {
      toast.error('Debe ingresar un nombre para la lista de materiales')
      return
    }
    if (!unitMeasureId) {
      toast.error('Debe seleccionar la unidad de medida de salida')
      return
    }

    const invalidRow = items.find(item => !item.product_id || item.quantity <= 0 || !item.unit_measure_id)
    if (invalidRow) {
      toast.error('Por favor complete todos los componentes con cantidades válidas y unidades')
      return
    }

    startTransition(async () => {
      const res = await createBomAction(
        {
          product_id: productId,
          name,
          version,
          output_quantity: outputQuantity,
          unit_measure_id: unitMeasureId,
          notes: notes || undefined,
        },
        items
      )

      if (res.success) {
        toast.success('Lista de materiales creada exitosamente')
        router.push('/bill-of-materials')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="name">Nombre de la Lista (BOM)</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ej. Fórmula estándar de Aditivo X"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="version">Versión</Label>
          <Input
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            required
            placeholder="Ej. 1.0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="product_id">Producto Terminado / Salida</Label>
          <select
            id="product_id"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Seleccione un producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="output_quantity">Cantidad de Salida (Output)</Label>
          <Input
            id="output_quantity"
            type="number"
            min={1}
            value={outputQuantity}
            onChange={(e) => setOutputQuantity(Number(e.target.value) || 1)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="unit_measure_id">Unidad de Medida</Label>
          <select
            id="unit_measure_id"
            value={unitMeasureId}
            onChange={(e) => setUnitMeasureId(e.target.value)}
            required
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Seleccione una unidad...</option>
            {unitMeasures.map(um => (
              <option key={um.id} value={um.id}>
                {um.name} ({um.abbreviation})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-sm font-semibold tracking-tight">Componentes / Ingredientes</h2>
          <Button type="button" size="sm" onClick={handleAddRow} className="h-8">
            <Plus className="w-3.5 h-3.5 mr-1" /> Agregar Componente
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((row, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 items-end md:items-center">
              <div className="w-full md:flex-1 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Producto Componente</Label>}
                <select
                  value={row.product_id}
                  onChange={(e) => handleRowChange(idx, 'product_id', e.target.value)}
                  required
                  className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Seleccione componente...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-28 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Cantidad Necesaria</Label>}
                <Input
                  type="number"
                  step="0.0001"
                  min={0.0001}
                  value={row.quantity}
                  onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                  required
                />
              </div>

              <div className="w-36 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Unidad</Label>}
                <select
                  value={row.unit_measure_id}
                  onChange={(e) => handleRowChange(idx, 'unit_measure_id', e.target.value)}
                  required
                  className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Seleccione unidad...</option>
                  {unitMeasures.map(um => (
                    <option key={um.id} value={um.id}>
                      {um.name} ({um.abbreviation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Merma (%)</Label>}
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={row.scrap_pct}
                  onChange={(e) => handleRowChange(idx, 'scrap_pct', e.target.value)}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(idx)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 mb-[2px]"
                disabled={items.length === 1}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas de Preparación / Instrucciones</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pasos detallados de mezclado, temperatura, tiempos, precauciones..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/bill-of-materials')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gradient-primary text-white border-0"
        >
          <Save className="w-4 h-4 mr-2" /> Guardar BOM
        </Button>
      </div>
    </form>
  )
}
