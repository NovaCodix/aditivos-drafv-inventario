'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { formatDate } from '@/shared/lib/utils'
import { createBatchAction, updateBatchAction, deleteBatchAction } from '../actions/batches.actions'

interface BatchWithProduct {
  id: string
  product_id: string
  batch_number: string
  manufacture_date: string | null
  expiration_date: string | null
  quantity: number
  notes: string | null
  is_active: boolean
  product?: { id: string; name: string; sku: string } | null
}

interface ProductSelectOption {
  id: string
  name: string
  sku: string
}

interface BatchesClientProps {
  initialBatches: BatchWithProduct[]
  products: ProductSelectOption[]
}

export function BatchesClient({ initialBatches, products }: BatchesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<BatchWithProduct | null>(null)

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const handleOpenNew = () => {
    setSelectedBatch(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (batch: BatchWithProduct) => {
    setSelectedBatch(batch)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = selectedBatch
        ? await updateBatchAction(selectedBatch.id, formData)
        : await createBatchAction(formData)

      if (res.success) {
        toast.success(selectedBatch ? 'Lote actualizado' : 'Lote creado')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este lote?')) return

    startTransition(async () => {
      const res = await deleteBatchAction(id)
      if (res.success) {
        toast.success('Lote desactivado')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-batch-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Lote
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
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">N° Lote</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Producto</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Fabricación</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Vencimiento</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Cantidad</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialBatches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Layers className="w-10 h-10 opacity-20 mx-auto mb-2" />
                      <p className="text-sm">No hay lotes registrados</p>
                    </td>
                  </tr>
                ) : (
                  initialBatches.map((batch, index) => {
                    const expDate = batch.expiration_date ? new Date(batch.expiration_date) : null
                    const isExpired = expDate ? expDate < now : false
                    const isExpiringSoon = expDate ? (expDate >= now && expDate <= thirtyDaysFromNow) : false

                    return (
                      <tr
                        key={batch.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        id={`batch-row-${batch.id}`}
                      >
                        <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
                            {batch.batch_number}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {batch.product ? (
                            <div>
                              <p className="font-medium text-xs">{batch.product.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{batch.product.sku}</p>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground text-center">
                          {formatDate(batch.manufacture_date)}
                        </td>
                        <td className="py-3 px-4 text-xs text-center">
                          <span className={isExpired ? 'text-red-600 dark:text-red-400 font-medium' : isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-muted-foreground'}>
                            {formatDate(batch.expiration_date)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {batch.quantity}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isExpired ? (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">Vencido</Badge>
                          ) : isExpiringSoon ? (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">Por vencer</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">Vigente</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenEdit(batch)}
                              className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                              id={`edit-batch-${batch.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(batch.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                              id={`delete-batch-${batch.id}`}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
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
              <DialogTitle>
                {selectedBatch ? 'Editar Lote' : 'Nuevo Lote'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="product_id">Producto</Label>
                <select
                  id="product_id"
                  name="product_id"
                  defaultValue={selectedBatch?.product_id || ''}
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="batch_number">Número de Lote</Label>
                  <Input 
                    id="batch_number" 
                    name="batch_number" 
                    defaultValue={selectedBatch?.batch_number || ''} 
                    required 
                    placeholder="Ej. LOT-2026-001" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quantity">Cantidad Inicial</Label>
                  <Input 
                    id="quantity" 
                    name="quantity" 
                    type="number"
                    defaultValue={selectedBatch?.quantity ?? 0} 
                    required 
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="manufacture_date">Fecha Fabricación</Label>
                  <Input 
                    id="manufacture_date" 
                    name="manufacture_date" 
                    type="date"
                    defaultValue={selectedBatch?.manufacture_date ? selectedBatch.manufacture_date.substring(0, 10) : ''} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expiration_date">Fecha Vencimiento</Label>
                  <Input 
                    id="expiration_date" 
                    name="expiration_date" 
                    type="date"
                    defaultValue={selectedBatch?.expiration_date ? selectedBatch.expiration_date.substring(0, 10) : ''} 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  defaultValue={selectedBatch?.notes || ''} 
                  placeholder="Notas adicionales" 
                  rows={2}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  {selectedBatch ? 'Guardar Cambios' : 'Crear Lote'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
