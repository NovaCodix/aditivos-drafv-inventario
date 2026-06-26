'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Tag, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '../actions/categories.actions'
import type { CategoryWithParent } from '../services/categories.service'

interface CategoriesClientProps {
  initialCategories: CategoryWithParent[]
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithParent | null>(null)

  const handleOpenNew = () => {
    setSelectedCategory(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (category: CategoryWithParent) => {
    setSelectedCategory(category)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = selectedCategory 
        ? await updateCategoryAction(selectedCategory.id, formData)
        : await createCategoryAction(formData)

      if (res.success) {
        toast.success(selectedCategory ? 'Categoría actualizada' : 'Categoría creada')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar esta categoría?')) return

    startTransition(async () => {
      const res = await deleteCategoryAction(id)
      if (res.success) {
        toast.success('Categoría desactivada')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-category-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
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
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Nombre</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Descripción</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Subcategoría De</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="w-10 h-10 opacity-20" />
                        <p className="text-sm">No hay categorías registradas</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  initialCategories.map((cat, index) => (
                    <tr
                      key={cat.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      id={`category-${cat.id}`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-4 text-left font-medium text-xs">
                        {cat.name}
                      </td>
                      <td className="py-3 px-4 text-left text-xs text-muted-foreground max-w-[200px] truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                        {cat.parent ? (cat.parent as { name: string }).name : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={cat.is_active ? 'default' : 'secondary'} className="text-xs inline-flex justify-center">
                          {cat.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(cat)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                            id={`edit-category-${cat.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(cat.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                            id={`delete-category-${cat.id}`}
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
                {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={selectedCategory?.name || ''} 
                  required 
                  placeholder="Nombre de la categoría" 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={selectedCategory?.description || ''} 
                  placeholder="Descripción opcional" 
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="parent_id">Subcategoría De</Label>
                <select
                  id="parent_id"
                  name="parent_id"
                  defaultValue={selectedCategory?.parent_id || ''}
                  className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Ninguna (Categoría Principal)</option>
                  {initialCategories
                    .filter(c => c.id !== selectedCategory?.id && !c.parent_id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sort_order">Orden de Clasificación</Label>
                <Input 
                  id="sort_order" 
                  name="sort_order" 
                  type="number"
                  defaultValue={selectedCategory?.sort_order || 0} 
                  min={0}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  {selectedCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
