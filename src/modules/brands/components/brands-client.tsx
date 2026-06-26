'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Award, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { createBrandAction, updateBrandAction, deleteBrandAction } from '../actions/brands.actions'
import type { Brand } from '@/shared/types/database.types'

interface BrandsClientProps {
  initialBrands: Brand[]
}

export function BrandsClient({ initialBrands }: BrandsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)

  const handleOpenNew = () => {
    setSelectedBrand(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (brand: Brand) => {
    setSelectedBrand(brand)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = selectedBrand
        ? await updateBrandAction(selectedBrand.id, formData)
        : await createBrandAction(formData)

      if (res.success) {
        toast.success(selectedBrand ? 'Marca actualizada' : 'Marca creada')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta marca?')) return

    startTransition(async () => {
      const res = await deleteBrandAction(id)
      if (res.success) {
        toast.success('Marca desactivada')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-brand-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Marca
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
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialBrands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-muted-foreground">
                      <p className="text-sm">No hay marcas registradas</p>
                    </td>
                  </tr>
                ) : (
                  initialBrands.map((brand, index) => (
                    <tr
                      key={brand.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      id={`brand-${brand.id}`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{brand.name}</p>
                            {brand.description && (
                              <p className="text-xs text-muted-foreground">{brand.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <Badge variant={brand.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {brand.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(brand)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                            id={`edit-brand-${brand.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(brand.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                            id={`delete-brand-${brand.id}`}
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
                {selectedBrand ? 'Editar Marca' : 'Nueva Marca'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={selectedBrand?.name || ''} 
                  required 
                  placeholder="Nombre de la marca" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={selectedBrand?.description || ''} 
                  placeholder="Descripción opcional" 
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="logo_url">URL del Logo</Label>
                <Input 
                  id="logo_url" 
                  name="logo_url" 
                  type="url"
                  defaultValue={selectedBrand?.logo_url || ''} 
                  placeholder="https://ejemplo.com/logo.png" 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website">Sitio Web</Label>
                <Input 
                  id="website" 
                  name="website" 
                  type="url"
                  defaultValue={selectedBrand?.website || ''} 
                  placeholder="https://ejemplo.com" 
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  {selectedBrand ? 'Guardar Cambios' : 'Crear Marca'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
