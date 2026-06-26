'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash, Truck, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { createSupplierAction, updateSupplierAction, deleteSupplierAction } from '../actions/suppliers.actions'
import type { Supplier } from '@/shared/types/database.types'

interface SuppliersClientProps {
  initialSuppliers: Supplier[]
}

export function SuppliersClient({ initialSuppliers }: SuppliersClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  const handleOpenNew = () => {
    setSelectedSupplier(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = selectedSupplier
        ? await updateSupplierAction(selectedSupplier.id, formData)
        : await createSupplierAction(formData)

      if (res.success) {
        toast.success(selectedSupplier ? 'Proveedor actualizado' : 'Proveedor creado')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este proveedor?')) return

    startTransition(async () => {
      const res = await deleteSupplierAction(id)
      if (res.success) {
        toast.success('Proveedor desactivado')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-supplier-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
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
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Razón Social</th>
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">RUC</th>
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Contacto</th>
                  <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Ciudad</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Crédito (días)</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-muted-foreground">
                      <Truck className="w-10 h-10 opacity-20 mx-auto mb-2" />
                      <p className="text-sm">No hay proveedores registrados</p>
                    </td>
                  </tr>
                ) : (
                  initialSuppliers.map((supplier, index) => (
                    <tr
                      key={supplier.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      id={`supplier-${supplier.id}`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Truck className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-tight">{supplier.business_name}</p>
                            {supplier.contact_name && (
                              <p className="text-[10px] text-muted-foreground">{supplier.contact_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-xs font-mono text-muted-foreground">
                        {supplier.ruc || '—'}
                      </td>
                      <td className="py-3 px-6">
                        <div className="space-y-0.5">
                          {supplier.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3 shrink-0" /> {supplier.phone}
                            </p>
                          )}
                          {supplier.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 max-w-[160px] truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{supplier.email}</span>
                            </p>
                          )}
                          {!supplier.phone && !supplier.email && <span className="text-xs text-muted-foreground/60">—</span>}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-xs text-muted-foreground">
                        {supplier.city ? `📍 ${supplier.city}, ${supplier.country}` : '—'}
                      </td>
                      <td className="py-3 px-6 text-center text-xs">
                        {supplier.credit_days && supplier.credit_days > 0 ? (
                          <span className="font-medium">{supplier.credit_days} días</span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <Badge variant={supplier.is_active ? 'default' : 'secondary'} className="text-xs">
                          {supplier.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(supplier)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                            id={`edit-supplier-${supplier.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(supplier.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                            id={`delete-supplier-${supplier.id}`}
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
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="business_name">Razón Social</Label>
                  <Input 
                    id="business_name" 
                    name="business_name" 
                    defaultValue={selectedSupplier?.business_name || ''} 
                    required 
                    placeholder="Ej. Distribuidora S.A.C." 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input 
                    id="ruc" 
                    name="ruc" 
                    defaultValue={selectedSupplier?.ruc || ''} 
                    required
                    pattern="^\d{11}$"
                    maxLength={11}
                    placeholder="11 dígitos" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_name">Nombre de Contacto</Label>
                  <Input 
                    id="contact_name" 
                    name="contact_name" 
                    defaultValue={selectedSupplier?.contact_name || ''} 
                    placeholder="Ej. Juan Pérez" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    defaultValue={selectedSupplier?.phone || ''} 
                    placeholder="Ej. 987654321" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    defaultValue={selectedSupplier?.email || ''} 
                    placeholder="Ej. proveedor@correo.com" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Dirección</Label>
                <Input 
                  id="address" 
                  name="address" 
                  defaultValue={selectedSupplier?.address || ''} 
                  placeholder="Ej. Calle Los Pinos 456" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    defaultValue={selectedSupplier?.city || ''} 
                    placeholder="Ej. Lima" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">País</Label>
                  <Input 
                    id="country" 
                    name="country" 
                    defaultValue={selectedSupplier?.country || 'Perú'} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="credit_days">Días de Crédito</Label>
                  <Input 
                    id="credit_days" 
                    name="credit_days" 
                    type="number"
                    defaultValue={selectedSupplier?.credit_days || 0} 
                    min={0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    type="url"
                    defaultValue={selectedSupplier?.website || ''} 
                    placeholder="Ej. https://proveedor.com" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  defaultValue={selectedSupplier?.notes || ''} 
                  placeholder="Notas adicionales" 
                  rows={2}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  {selectedSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
