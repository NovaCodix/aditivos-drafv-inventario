'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowDown, ArrowUp, Sliders, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { formatDateTime } from '@/shared/lib/utils'
import { createMovementAction } from '../actions/movements.actions'

const movementIcons = {
  ENTRY:        { icon: ArrowDown,      color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',   label: 'Entrada'   },
  EXIT:         { icon: ArrowUp,        color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',       label: 'Salida'    },
  TRANSFER_IN:  { icon: ArrowDown,      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',     label: 'T. Entrada'},
  TRANSFER_OUT: { icon: ArrowUp,        color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'T. Salida' },
  ADJUSTMENT:   { icon: Sliders,        color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Ajuste'    },
}

interface MovementWithRelations {
  id: string
  product_id: string
  warehouse_id: string
  batch_id: string | null
  location_id: string | null
  movement_type: string
  quantity: number
  stock_before: number
  stock_after: number
  notes: string | null
  created_at: string
  product?: { id: string; name: string; sku: string } | null
  warehouse?: { id: string; name: string } | null
  batch?: { id: string; batch_number: string } | null
}

interface ProductOption {
  id: string
  name: string
  sku: string
}

interface WarehouseOption {
  id: string
  name: string
}

interface BatchOption {
  id: string
  batch_number: string
  product_id: string
}

interface LocationOption {
  id: string
  code: string
  warehouse_id: string
}

interface MovementsClientProps {
  initialMovements: MovementWithRelations[]
  products: ProductOption[]
  warehouses: WarehouseOption[]
  batches: BatchOption[]
  locations: LocationOption[]
}

export function MovementsClient({
  initialMovements,
  products,
  warehouses,
  batches,
  locations,
}: MovementsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')

  const handleOpenNew = () => {
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const res = await createMovementAction(formData)
      if (res.success) {
        toast.success('Movimiento registrado exitosamente')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const filteredLocations = locations.filter(l => l.warehouse_id === selectedWarehouseId)
  const filteredBatches = batches.filter(b => b.product_id === selectedProductId)

  return (
    <PageShell
      registerButton={
        <Button id="new-movement-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Movimiento
        </Button>
      }
    >
      <div className="w-full min-w-0 flex flex-col">
        <div className="px-4 md:px-6 pt-2 pb-4">
          <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Tipo</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Producto</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Almacén</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Lote</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Cantidad</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Stock Antes</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Stock Después</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Notas</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {initialMovements.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ArrowLeftRight className="w-10 h-10 opacity-20" />
                        <p className="text-sm">No hay movimientos registrados</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  initialMovements.map((movement, index) => {
                    const config = movementIcons[movement.movement_type as keyof typeof movementIcons]
                    const Icon = config?.icon || ArrowLeftRight
                    return (
                      <tr
                        key={movement.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        id={`movement-row-${movement.id}`}
                      >
                        <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config?.bg}`}>
                              <Icon className={`w-3.5 h-3.5 ${config?.color}`} />
                            </div>
                            <span className="text-xs font-medium">{config?.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {movement.product ? (
                            <div>
                              <p className="font-medium text-xs">{movement.product.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{movement.product.sku}</p>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">{movement.product_id.substring(0, 8)}...</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground text-center">
                          {movement.warehouse?.name || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-muted-foreground text-center">
                          {movement.batch?.batch_number || '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-mono font-bold text-sm ${
                            ['ENTRY', 'TRANSFER_IN'].includes(movement.movement_type)
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {['ENTRY', 'TRANSFER_IN'].includes(movement.movement_type) ? '+' : '-'}{movement.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs text-muted-foreground">
                          {movement.stock_before}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs font-semibold">
                          {movement.stock_after}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-32 truncate text-center">
                          {movement.notes || '—'}
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(movement.created_at)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="product_id">Producto</Label>
                <select
                  id="product_id"
                  name="product_id"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
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
                <Label htmlFor="warehouse_id">Almacén</Label>
                <select
                  id="warehouse_id"
                  name="warehouse_id"
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="batch_id">Lote (Opcional)</Label>
                  <select
                    id="batch_id"
                    name="batch_id"
                    className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Sin lote...</option>
                    {filteredBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batch_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location_id">Ubicación (Opcional)</Label>
                  <select
                    id="location_id"
                    name="location_id"
                    className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Sin ubicación...</option>
                    {filteredLocations.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="movement_type">Tipo de Movimiento</Label>
                  <select
                    id="movement_type"
                    name="movement_type"
                    required
                    className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="ENTRY">Entrada</option>
                    <option value="EXIT">Salida</option>
                    <option value="ADJUSTMENT">Ajuste de Stock</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input 
                    id="quantity" 
                    name="quantity" 
                    type="number"
                    required 
                    min={1}
                    placeholder="Cantidad mayor a 0" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit_cost">Costo Unitario (Opcional)</Label>
                <Input 
                  id="unit_cost" 
                  name="unit_cost" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="Ej. 12.50" 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas / Justificación</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Detalles sobre este movimiento" 
                  rows={2}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  Registrar Movimiento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
