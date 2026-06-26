'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { PageShell } from '@/shared/components/layout/page-shell'
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from '../actions/customers.actions'
import type { Customer } from '@/shared/types/database.types'

interface CustomersClientProps {
  initialCustomers: Customer[]
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const handleOpenNew = () => {
    setSelectedCustomer(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', 'true')

    startTransition(async () => {
      const res = selectedCustomer
        ? await updateCustomerAction(selectedCustomer.id, formData)
        : await createCustomerAction(formData)

      if (res.success) {
        toast.success(selectedCustomer ? 'Cliente actualizado' : 'Cliente creado')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este cliente?')) return

    startTransition(async () => {
      const res = await deleteCustomerAction(id)
      if (res.success) {
        toast.success('Cliente desactivado')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-customer-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
        </Button>
      }
    >
      <div className="w-full min-w-0 flex flex-col">
        <div className="px-4 md:px-6 pt-2 pb-4">
          <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Razón Social</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">RUC</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Tipo</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Contacto</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Email</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Crédito</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {initialCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-muted-foreground">
                      <Users className="w-10 h-10 opacity-20 mx-auto mb-2" />
                      <p className="text-sm">No hay clientes registrados</p>
                    </td>
                  </tr>
                ) : initialCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                    <td className="py-3 px-6 font-medium text-sm text-center">{customer.business_name}</td>
                    <td className="py-3 px-6 text-muted-foreground font-mono text-xs text-center">{customer.ruc || '—'}</td>
                    <td className="py-3 px-6 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {customer.customer_type}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-muted-foreground text-xs text-center">{customer.contact_name || '—'}</td>
                    <td className="py-3 px-6 text-muted-foreground text-xs text-center">{customer.email || '—'}</td>
                    <td className="py-3 px-6 text-muted-foreground text-xs text-center">{customer.credit_days}d</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEdit(customer)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                          id={`edit-customer-${customer.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(customer.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20" 
                          id={`delete-customer-${customer.id}`}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="business_name">Razón Social</Label>
                <Input 
                  id="business_name" 
                  name="business_name" 
                  defaultValue={selectedCustomer?.business_name || ''} 
                  required 
                  placeholder="Ej. Mi Cliente S.A.C." 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ruc">RUC</Label>
                <Input 
                  id="ruc" 
                  name="ruc" 
                  defaultValue={selectedCustomer?.ruc || ''} 
                  required
                  pattern="^\d{11}$"
                  maxLength={11}
                  placeholder="11 dígitos" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer_type">Tipo de Cliente</Label>
                <select
                  id="customer_type"
                  name="customer_type"
                  defaultValue={selectedCustomer?.customer_type || 'RETAIL'}
                  className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="RETAIL">Minorista (Retail)</option>
                  <option value="WHOLESALE">Mayorista</option>
                  <option value="DISTRIBUTOR">Distribuidor</option>
                  <option value="GOVERNMENT">Gobierno</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Nombre de Contacto</Label>
                <Input 
                  id="contact_name" 
                  name="contact_name" 
                  defaultValue={selectedCustomer?.contact_name || ''} 
                  placeholder="Ej. María Gómez" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  defaultValue={selectedCustomer?.phone || ''} 
                  placeholder="Ej. 987654321" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  defaultValue={selectedCustomer?.email || ''} 
                  placeholder="Ej. cliente@correo.com" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección</Label>
              <Input 
                id="address" 
                name="address" 
                defaultValue={selectedCustomer?.address || ''} 
                placeholder="Ej. Av. Larco 789" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">Ciudad</Label>
                <Input 
                  id="city" 
                  name="city" 
                  defaultValue={selectedCustomer?.city || ''} 
                  placeholder="Ej. Lima" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">País</Label>
                <Input 
                  id="country" 
                  name="country" 
                  defaultValue={selectedCustomer?.country || 'Perú'} 
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
                  defaultValue={selectedCustomer?.credit_days || 0} 
                  min={0}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="credit_limit">Límite de Crédito</Label>
                <Input 
                  id="credit_limit" 
                  name="credit_limit" 
                  type="number"
                  defaultValue={selectedCustomer?.credit_limit || 0} 
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                defaultValue={selectedCustomer?.notes || ''} 
                placeholder="Notas adicionales" 
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                {selectedCustomer ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
