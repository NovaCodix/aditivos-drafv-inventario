'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash, Warehouse as WarehouseIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { createWarehouseAction, updateWarehouseAction, deleteWarehouseAction } from '../actions/warehouses.actions'
import type { Warehouse } from '@/shared/types/database.types'

interface WarehousesClientProps {
  initialWarehouses: Warehouse[]
}

export function WarehousesClient({ initialWarehouses }: WarehousesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)

  const handleOpenNew = () => {
    setSelectedWarehouse(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = selectedWarehouse
        ? await updateWarehouseAction(selectedWarehouse.id, formData)
        : await createWarehouseAction(formData)

      if (res.success) {
        toast.success(selectedWarehouse ? 'Almacén actualizado' : 'Almacén creado')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este almacén?')) return

    startTransition(async () => {
      const res = await deleteWarehouseAction(id)
      if (res.success) {
        toast.success('Almacén desactivado')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-warehouse-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Almacén
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
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nombre</th>
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Descripción</th>
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Dirección</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialWarehouses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <p className="text-sm">No hay almacenes registrados</p>
                    </td>
                  </tr>
                ) : (
                  initialWarehouses.map((warehouse, index) => (
                    <tr
                      key={warehouse.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      id={`warehouse-${warehouse.id}`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
                            <WarehouseIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-sm">{warehouse.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-xs text-muted-foreground">
                        {warehouse.description || '—'}
                      </td>
                      <td className="py-3 px-6 text-xs text-muted-foreground">
                        {warehouse.address ? `📍 ${warehouse.address}` : '—'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <Badge variant={warehouse.is_active ? 'default' : 'secondary'} className="text-xs">
                          {warehouse.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs" 
                            render={<a href={`/locations?warehouse_id=${warehouse.id}`} id={`warehouse-locations-${warehouse.id}`} />}
                          >
                            Ver Ubicaciones
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(warehouse)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                            id={`edit-warehouse-${warehouse.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(warehouse.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                            id={`delete-warehouse-${warehouse.id}`}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedWarehouse ? 'Editar Almacén' : 'Nuevo Almacén'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={selectedWarehouse?.name || ''} 
                  required 
                  placeholder="Ej. Almacén Central" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={selectedWarehouse?.description || ''} 
                  placeholder="Descripción opcional" 
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Dirección</Label>
                <Input 
                  id="address" 
                  name="address" 
                  defaultValue={selectedWarehouse?.address || ''} 
                  placeholder="Ej. Av. Industrial 123" 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  defaultValue={selectedWarehouse?.phone || ''} 
                  placeholder="Ej. +51 987654321" 
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  {selectedWarehouse ? 'Guardar Cambios' : 'Crear Almacén'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
