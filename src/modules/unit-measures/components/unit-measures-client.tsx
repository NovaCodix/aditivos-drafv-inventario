'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { createUnitMeasureAction, updateUnitMeasureAction, deleteUnitMeasureAction } from '../actions/unit-measures.actions'
import type { UnitMeasure } from '@/shared/types/database.types'

interface UnitMeasuresClientProps {
  initialUnitMeasures: UnitMeasure[]
}

export function UnitMeasuresClient({ initialUnitMeasures }: UnitMeasuresClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<UnitMeasure | null>(null)

  const handleOpenNew = () => {
    setSelectedUnit(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (unit: UnitMeasure) => {
    setSelectedUnit(unit)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = selectedUnit
        ? await updateUnitMeasureAction(selectedUnit.id, formData)
        : await createUnitMeasureAction(formData)

      if (res.success) {
        toast.success(selectedUnit ? 'Unidad actualizada' : 'Unidad creada')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta unidad?')) return

    startTransition(async () => {
      const res = await deleteUnitMeasureAction(id)
      if (res.success) {
        toast.success('Unidad desactivada')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-unit-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Unidad
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
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Abreviatura</th>
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nombre</th>
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Descripción</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialUnitMeasures.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                      No hay unidades de medida registradas
                    </td>
                  </tr>
                ) : (
                  initialUnitMeasures.map((um, index) => (
                    <tr
                      key={um.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      id={`unit-${um.id}`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-6 text-center">
                        <span className="font-mono text-base font-bold text-primary">{um.abbreviation}</span>
                      </td>
                      <td className="py-3 px-6 font-medium text-sm">{um.name}</td>
                      <td className="py-3 px-6 text-xs text-muted-foreground">
                        {um.description || '—'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <Badge variant={um.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {um.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(um)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                            id={`edit-unit-${um.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(um.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                            id={`delete-unit-${um.id}`}
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
                {selectedUnit ? 'Editar Unidad' : 'Nueva Unidad'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="name">Nombre</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={selectedUnit?.name || ''} 
                    required 
                    placeholder="Ej. Kilogramo" 
                  />
                </div>
                <div className="col-span-1 space-y-1.5">
                  <Label htmlFor="abbreviation">Abrev.</Label>
                  <Input 
                    id="abbreviation" 
                    name="abbreviation" 
                    defaultValue={selectedUnit?.abbreviation || ''} 
                    required 
                    placeholder="Ej. kg" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={selectedUnit?.description || ''} 
                  placeholder="Descripción opcional" 
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  {selectedUnit ? 'Guardar Cambios' : 'Crear Unidad'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
