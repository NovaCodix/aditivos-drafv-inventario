'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createInvoiceAction } from '../actions/invoicing.actions'
import type { Customer } from '@/shared/types/database.types'

interface ProductSelectOption {
  id: string
  name: string
  sku: string
  sale_price: number
}

interface SalesOrderOption {
  id: string
  code: string
  customer_id: string
}

interface InvoiceFormProps {
  customers: Customer[]
  salesOrders: SalesOrderOption[]
  products: ProductSelectOption[]
}

interface DetailRow {
  product_id: string
  description: string
  quantity: number
  unit_price: number
  discount_pct: number
}

export function InvoiceForm({ customers, salesOrders, products }: InvoiceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [invoiceSeries, setInvoiceSeries] = useState('F001')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [salesOrderId, setSalesOrderId] = useState('')
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState('')
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [notes, setNotes] = useState('')
  const [taxRate, setTaxRate] = useState(18)

  const [details, setDetails] = useState<DetailRow[]>([
    { product_id: '', description: '', quantity: 1, unit_price: 0, discount_pct: 0 }
  ])

  const handleAddRow = () => {
    setDetails([...details, { product_id: '', description: '', quantity: 1, unit_price: 0, discount_pct: 0 }])
  }

  const handleRemoveRow = (index: number) => {
    if (details.length === 1) return
    setDetails(details.filter((_, i) => i !== index))
  }

  const handleRowChange = (index: number, field: keyof DetailRow, value: string | number) => {
    const updated = [...details]
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value)
      updated[index] = {
        ...updated[index],
        product_id: String(value),
        description: prod ? prod.name : '',
        unit_price: prod ? prod.sale_price : 0,
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: field === 'description' ? value : Number(value) || 0
      }
    }
    setDetails(updated)
  }

  const subtotal = details.reduce((sum, row) => {
    return sum + row.quantity * row.unit_price * (1 - row.discount_pct / 100)
  }, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceNumber) {
      toast.error('Debe ingresar el número de factura')
      return
    }
    if (!customerId) {
      toast.error('Debe seleccionar un cliente')
      return
    }

    const invalidRow = details.find(d => d.quantity <= 0 || d.unit_price < 0 || !d.description)
    if (invalidRow) {
      toast.error('Por favor complete todos los campos de los ítems de manera válida')
      return
    }

    startTransition(async () => {
      const res = await createInvoiceAction(
        {
          invoice_series: invoiceSeries,
          invoice_number: invoiceNumber,
          customer_id: customerId,
          sales_order_id: salesOrderId || undefined,
          issue_date: issueDate || undefined,
          due_date: dueDate || undefined,
          tax_rate: taxRate,
          currency,
          payment_method: paymentMethod,
          notes: notes || undefined,
        },
        details
      )

      if (res.success) {
        toast.success('Factura borrador creada exitosamente')
        router.push('/invoicing')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto bg-card p-6 rounded-2xl border border-border/40 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="invoice_series">Serie</Label>
          <Input
            id="invoice_series"
            value={invoiceSeries}
            onChange={(e) => setInvoiceSeries(e.target.value)}
            required
            placeholder="Ej. F001"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="invoice_number">Número</Label>
          <Input
            id="invoice_number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
            placeholder="Ej. 00000123"
          />
        </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="issue_date">Fecha Emisión</Label>
          <Input
            id="issue_date"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="due_date">Fecha Vencimiento</Label>
          <Input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
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

        <div className="space-y-1.5">
          <Label htmlFor="payment_method">Método Pago</Label>
          <select
            id="payment_method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="CASH">Efectivo</option>
            <option value="BANK_TRANSFER">Transferencia</option>
            <option value="CREDIT">Crédito</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sales_order_id">Orden de Venta (Opcional)</Label>
          <select
            id="sales_order_id"
            value={salesOrderId}
            onChange={(e) => setSalesOrderId(e.target.value)}
            className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">Ninguna...</option>
            {salesOrders.map(so => (
              <option key={so.id} value={so.id}>
                {so.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-sm font-semibold tracking-tight">Ítems de la Factura</h2>
          <Button type="button" size="sm" onClick={handleAddRow} className="h-8">
            <Plus className="w-3.5 h-3.5 mr-1" /> Agregar Ítem
          </Button>
        </div>

        <div className="space-y-2">
          {details.map((row, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-3 items-end md:items-center">
              <div className="w-48 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Producto (Opcional)</Label>}
                <select
                  value={row.product_id}
                  onChange={(e) => handleRowChange(idx, 'product_id', e.target.value)}
                  className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Libre/Ninguno...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:flex-1 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Descripción / Concepto</Label>}
                <Input
                  value={row.description}
                  onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                  required
                  placeholder="Detalle de venta..."
                />
              </div>

              <div className="w-20 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Cant.</Label>}
                <Input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                  required
                />
              </div>

              <div className="w-28 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Precio Unit.</Label>}
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.unit_price}
                  onChange={(e) => handleRowChange(idx, 'unit_price', e.target.value)}
                  required
                />
              </div>

              <div className="w-20 space-y-1">
                {idx === 0 && <Label className="text-[11px]">Desc (%)</Label>}
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
                {currency} {(row.quantity * row.unit_price * (1 - row.discount_pct / 100)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
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
          <Label htmlFor="notes">Notas / Glosa</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Información adicional impresa en la factura..."
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
          onClick={() => router.push('/invoicing')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gradient-primary text-white border-0"
        >
          <Save className="w-4 h-4 mr-2" /> Guardar Factura
        </Button>
      </div>
    </form>
  )
}
