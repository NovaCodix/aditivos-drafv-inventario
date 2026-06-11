import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Plus, Eye, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/shared/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Usuarios' }

async function UsersContent() {
  const supabase = await createClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles!user_id(
        role:roles(id, name)
      )
    `)
    .order('full_name')

  if (error) {
    return (
      <div className="text-center py-12 border border-destructive/20 bg-destructive/5 rounded-2xl text-destructive text-sm font-semibold">
        Error al cargar los usuarios: {error.message}
      </div>
    )
  }

  return (
    <Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden !p-0">
      <CardContent className="p-0">
        {(!profiles || profiles.length === 0) ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-2.5">
            <p className="text-sm font-semibold">No hay perfiles de usuario registrados</p>
            <p className="text-xs opacity-60">Los usuarios que se registren en Supabase Auth aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Usuario</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Email</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Roles</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
                  <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {profiles.map(profile => (
                  <tr 
                    key={profile.id} 
                    className="hover:bg-muted/20 transition-all duration-200 border-b border-border/25 last:border-none" 
                    id={`user-row-${profile.id}`}
                  >
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-full gradient-primary flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
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
                        <Switch checked={profile.is_active} id={`status-${profile.id}`} />
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" id={`edit-user-${profile.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <DataTablePagination totalItems={profiles.length} />
      </CardContent>
    </Card>
  )
}

export default async function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Usuarios</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de usuarios y asignación de roles del sistema</p>
        </div>
        <Button id="create-user-btn" className="gradient-primary text-white border-0 shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>
      <UsersContent />
    </div>
  )
}
