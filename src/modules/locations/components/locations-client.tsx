'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { createLocationAction, updateLocationAction, deleteLocationAction } from '../actions/locations.actions'
import type { Warehouse } from '@/shared/types/database.types'

interface LocationWithWarehouse {
  id: string
  warehouse_id: string
  code: string
  aisle: string | null
  rack: string | null
  level: string | null
  description: string | null
  is_active: boolean
  warehouse?: { id: string; name: string } | null
}

interface LocationsClientProps {
  initialLocations: LocationWithWarehouse[]
  warehouses: Warehouse[]
}

export function LocationsClient({ initialLocations, warehouses }: LocationsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationWithWarehouse | null>(null)

  const handleOpenNew = () => {
    setSelectedLocation(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (loc: LocationWithWarehouse) => {
    setSelectedLocation(loc)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = selectedLocation
        ? await updateLocationAction(selectedLocation.id, formData)
        : await createLocationAction(formData)

      if (res.success) {
        toast.success(selectedLocation ? 'Ubicación actualizada' : 'Ubicación creada')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta ubicación?')) return

    startTransition(async () => {
      const res = await deleteLocationAction(id)
      if (res.success) {
        toast.success('Ubicación desactivada')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-location-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Ubicación
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
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Código</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Almacén</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Pasillo</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estante</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nivel</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Descripción</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialLocations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      <MapPin className="w-10 h-10 opacity-20 mx-auto mb-2" />
                      <p className="text-sm">No hay ubicaciones registradas</p>
                    </td>
                  </tr>
                ) : (
                  initialLocations.map((loc, index) => (
                    <tr key={loc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors" id={`location-row-${loc.id}`}>
                      <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded inline-block">
                          {loc.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-center">{loc.warehouse?.name || '—'}</td>
                      <td className="py-3 px-4 text-xs text-center">{loc.aisle || '—'}</td>
                      <td className="py-3 px-4 text-xs text-center">{loc.rack || '—'}</td>
                      <td className="py-3 px-4 text-xs text-center">{loc.level || '—'}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground text-center">{loc.description || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={loc.is_active ? 'default' : 'secondary'} className="text-xs inline-flex justify-center">
                          {loc.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(loc)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                            id={`edit-location-${loc.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(loc.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                            id={`delete-location-${loc.id}`}
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
                {selectedLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="warehouse_id">Almacén</Label>
                <select
                  id="warehouse_id"
                  name="warehouse_id"
                  defaultValue={selectedLocation?.warehouse_id || ''}
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
                <Label htmlFor="code">Código de Ubicación</Label>
                <Input 
                  id="code" 
                  name="code" 
                  defaultValue={selectedLocation?.code || ''} 
                  required 
                  placeholder="Ej. A-01-02" 
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="aisle">Pasillo</Label>
                  <Input 
                    id="aisle" 
                    name="aisle" 
                    defaultValue={selectedLocation?.aisle || ''} 
                    placeholder="Ej. A" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rack">Estante</Label>
                  <Input 
                    id="rack" 
                    name="rack" 
                    defaultValue={selectedLocation?.rack || ''} 
                    placeholder="Ej. 01" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="level">Nivel</Label>
                  <Input 
                    id="level" 
                    name="level" 
                    defaultValue={selectedLocation?.level || ''} 
                    placeholder="Ej. 02" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={selectedLocation?.description || ''} 
                  placeholder="Descripción opcional" 
                  rows={2}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  {selectedLocation ? 'Guardar Cambios' : 'Crear Ubicación'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
