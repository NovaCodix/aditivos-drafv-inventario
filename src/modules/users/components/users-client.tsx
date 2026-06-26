'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Eye, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageShell } from '@/shared/components/layout/page-shell'
import { createUserAction, updateUserAction, toggleUserStatusAction } from '../actions/users.actions'

interface RoleOption {
  id: string
  name: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  user_roles?: { role: { id: string; name: string } | null }[]
}

interface UsersClientProps {
  initialUsers: UserProfile[]
  roles: RoleOption[]
}

export function UsersClient({ initialUsers, roles }: UsersClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  const handleOpenNew = () => {
    setSelectedUser(null)
    setIsOpen(true)
  }

  const handleOpenEdit = (user: UserProfile) => {
    setSelectedUser(user)
    setIsOpen(true)
  }

  const handleStatusToggle = (user: UserProfile, checked: boolean) => {
    startTransition(async () => {
      const res = await toggleUserStatusAction(user.id, checked)
      if (res.success) {
        toast.success(`Usuario ${checked ? 'activado' : 'desactivado'}`)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.append('is_active', selectedUser ? String(selectedUser.is_active) : 'true')

    startTransition(async () => {
      const res = selectedUser
        ? await updateUserAction(selectedUser.id, formData)
        : await createUserAction(formData)

      if (res.success) {
        toast.success(selectedUser ? 'Usuario actualizado' : 'Usuario creado')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <PageShell
      registerButton={
        <Button id="create-user-btn" onClick={handleOpenNew} className="gradient-primary text-white border-0 shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
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
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Usuario</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Email</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Roles</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {initialUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-muted-foreground">
                      <p className="text-sm font-semibold">No hay perfiles de usuario registrados</p>
                    </td>
                  </tr>
                ) : (
                  initialUsers.map((profile, index) => (
                    <tr
                      key={profile.id}
                      className="hover:bg-muted/20 transition-all duration-200 border-b border-border/25 last:border-none"
                      id={`user-row-${profile.id}`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-full gradient-primary flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0">
                            {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'US'}
                          </div>
                          <span className="font-semibold text-sm text-foreground tracking-tight">{profile.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-muted-foreground/90 text-center">{profile.email}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {((profile.user_roles || []) as any[]).map((ur: any) => (
                            <Badge
                              key={ur.role?.name}
                              variant="secondary"
                              className="text-[10px] font-bold uppercase tracking-wide bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/10 px-2 py-0.5 rounded-md"
                            >
                              {ur.role?.name}
                            </Badge>
                          ))}
                          {(!profile.user_roles || profile.user_roles.length === 0) && (
                            <span className="text-xs text-muted-foreground/50 italic">Sin rol asignado</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Switch 
                            checked={profile.is_active} 
                            onCheckedChange={(checked) => handleStatusToggle(profile, checked)}
                            id={`status-${profile.id}`} 
                          />
                          <span className={cn(
                            "text-[10px] font-bold tracking-wider uppercase",
                            profile.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                          )}>
                            {profile.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(profile)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" 
                            id={`edit-user-${profile.id}`}
                          >
                            <Pencil className="w-4 h-4" />
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
                {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input 
                  id="full_name" 
                  name="full_name" 
                  defaultValue={selectedUser?.full_name || ''} 
                  required 
                  placeholder="Ej. Juan Pérez" 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  defaultValue={selectedUser?.email || ''} 
                  required 
                  disabled={!!selectedUser}
                  placeholder="Ej. usuario@correo.com" 
                />
              </div>

              {!selectedUser && (
                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password"
                    required 
                    placeholder="Mínimo 6 caracteres" 
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="role_id">Rol</Label>
                <select
                  id="role_id"
                  name="role_id"
                  defaultValue={selectedUser?.user_roles?.[0]?.role?.id || ''}
                  required
                  className="w-full text-xs rounded-lg bg-background border border-border/60 p-2 focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Seleccione un rol...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} className="gradient-primary text-white border-0">
                  {selectedUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageShell>
  )
}
