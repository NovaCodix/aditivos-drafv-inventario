import type { Metadata } from 'next'
import { Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/shared/lib/supabase/server'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Roles y Permisos' }

export default async function RolesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('roles')
    .select(`
      *,
      role_permissions(
        permission:permissions(module, action, description)
      )
    `)
    .order('name')

  const roles = data as any[]

  return (
    <PageShell>
      <div className="page-content grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(roles || []).map(role => {
          const permissions = (role as { role_permissions: { permission: { module: string; action: string } }[] }).role_permissions || []
          const modules = [...new Set(permissions.map(p => p.permission.module))]

          return (
            <Card key={role.id} className="hover:shadow-md transition-all" id={`role-${role.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{role.name}</CardTitle>
                    </div>
                  </div>
                  <Badge variant={role.is_active ? 'default' : 'secondary'} className="text-xs">
                    {role.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                {role.description && (
                  <CardDescription className="text-xs mt-2">{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {permissions.length} permisos en {modules.length} módulos
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {modules.map(module => (
                      <Badge key={module} variant="outline" className="text-[10px]">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageShell>
  )
}
