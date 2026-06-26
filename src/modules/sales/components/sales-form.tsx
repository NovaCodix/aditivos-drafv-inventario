'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createSalesOrderAction } from '../actions/sales.actions'
import type { Customer, Warehouse } from '@/shared/types/database.types'

interface ProductSelectOption {
  id: string
  name: string
  sku: string
}

interface SalesFormProps {
  customers: Customer[]
  warehouses: Warehouse[]
  products: ProductSelectOption[]
}

interface DetailRow {
  product_id: string
  quantity_ordered: number
  unit_price: number
  discount_pct: number
}

export function SalesForm({ customers, warehouses, products }: SalesFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [customerId, setCustomerId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN')
  const [notes, setNotes] = useState('')
  const [taxRate, setTaxRate] = useState(18)
  
  const [details, setDetails] = useState<DetailRow[]>([
    { product_id: '', quantity_ordered: 1, unit_price: 0, discount_pct: 0 }
  ])

  const handleAddRow = () => {
    setDetails([...details, { product_id: '', quantity_ordered: 1, unit_price: 0, discount_pct: 0 }])
  }

  const handleRemoveRow = (index: number) => {
    if (details.length === 1) return
    setDetails(details.filter((_, i) => i !== index))
  }

  const handleRowChange = (index: number, field: keyof DetailRow, value: string | number) => {
    const updated = [...details]
    updated[index] = {
      ...updated[index],
      [field]: field === 'product_id' ? value : Number(value) || 0
    }
    setDetails(updated)
  }

  const subtotal = details.reduce((sum, row) => {
    return sum + row.quantity_ordered * row.unit_price * (1 - row.discount_pct / 100)
  }, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) {
      toast.error('Debe seleccionar un cliente')
      return
    }
    if (!warehouseId) {
      toast.error('Debe seleccionar un almacén de despacho')
      return
    }

    const invalidRow = details.find(d => !d.product_id || d.quantity_ordered <= 0 || d.unit_price < 0)
    if (invalidRow) {
      toast.error('Por favor complete todos los campos de los ítems de manera válida')
      return
    }

    startTransition(async () => {
      const res = await createSalesOrderAction(
        customerId,
        warehouseId,
        {
          delivery_date: deliveryDate || undefined,
          notes: notes || undefined,
          tax_rate: taxRate,
          currency,
          exchange_rate: 1,
        },
        details
      )

      if (res.success) {
        toast.success('Orden de venta creada exitosamente')
        router.push('/sales')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="customer_id">Cliente</Label>
          <select
            id="customer_id"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Seleccione un cliente...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.business_name} ({c.ruc})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="warehouse_id">Almacén Despacho</Label>
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

        <div className="space-y-1.5">
          <Label htmlFor="currency">Moneda</Label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="delivery_date">Fecha Prometida de Entrega</Label>
          <Input
            id="delivery_date"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-sm font-semibold tracking-tight">Ítems de la Orden</h2>
          <Button type="button" size="sm" onClick={handleAddRow} className="h-8">
            <Plus className="w-3.5 h-3.5 mr-1" /> Agregar Ítem
          </Button>
        </div>

        <div className="space-y-2">
          {details.map((row, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 items-end md:items-center">
              <div className="w-full md:flex-1 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Producto</Label>}
                <select
                  value={row.product_id}
                  onChange={(e) => handleRowChange(idx, 'product_id', e.target.value)}
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

              <div className="w-24 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Cantidad</Label>}
                <Input
                  type="number"
                  min={1}
                  value={row.quantity_ordered}
                  onChange={(e) => handleRowChange(idx, 'quantity_ordered', e.target.value)}
                  required
                />
              </div>

              <div className="w-32 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Precio Unitario</Label>}
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.unit_price}
                  onChange={(e) => handleRowChange(idx, 'unit_price', e.target.value)}
                  required
                />
              </div>

              <div className="w-24 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Descuento (%)</Label>}
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={row.discount_pct}
                  onChange={(e) => handleRowChange(idx, 'discount_pct', e.target.value)}
                />
              </div>

              <div className="w-28 text-right font-mono text-xs font-semibold py-2">
                {idx === 0 && <div className="text-[11px] text-muted-foreground mb-1 text-center">Subtotal</div>}
                {currency} {(row.quantity_ordered * row.unit_price * (1 - row.discount_pct / 100)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(idx)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 mb-[2px]"
                disabled={details.length === 1}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas / Observaciones</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dirección alternativa de envío, condiciones de crédito, etc..."
            rows={3}
          />
        </div>

        <div className="bg-[#F8FAFC] dark:bg-slate-900/50 p-4 rounded-xl space-y-2 border border-border/30 h-fit">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal:</span>
            <span className="font-mono">{currency} {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground items-center">
            <span>IGV (18%):</span>
            <span className="font-mono">{currency} {taxAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-border/40 pt-2 text-foreground">
            <span>Total General:</span>
            <span className="font-mono">{currency} {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/sales')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gradient-primary text-white border-0"
        >
          <Save className="w-4 h-4 mr-2" /> Guardar Orden
        </Button>
      </div>
    </form>
  )
}
