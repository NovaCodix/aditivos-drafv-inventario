import { createClient } from '@/shared/lib/supabase/server'
import { cache } from 'react'

export type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE'

/**
 * Obtiene todos los permisos del usuario autenticado
 * Se usa React cache() para memoizar la llamada durante el request actual (Server Components)
 */
export const getUserPermissions = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      user_roles!user_id(
        role:roles(
          role_permissions(
            permission:permissions(
              module,
              action
            )
          )
        )
      )
    `)
    .eq('id', user.id)
    .single()

  const profileData = profiles as any

  if (!profileData || !profileData.user_roles) return []

  // Extraer y aplanar permisos
  const permissions = new Set<string>()

  // Usar aserciones de tipo para navegar la estructura anidada de Supabase
  const userRoles = profileData.user_roles as any[]

  for (const ur of userRoles) {
    if (ur.role && ur.role.role_permissions) {
      for (const rp of ur.role.role_permissions) {
        if (rp.permission) {
          permissions.add(`${rp.permission.module}:${rp.permission.action}`)
        }
      }
    }
  }

  return Array.from(permissions)
})

/**
 * Verifica si el usuario actual tiene un permiso específico
 */
export async function hasPermission(module: string, action: Action): Promise<boolean> {
  const permissions = await getUserPermissions()

  // Si tiene MANAGE en el módulo o en general (como SuperAdmin), permitir
  if (permissions.includes('ALL:MANAGE')) return true
  if (permissions.includes(`${module}:MANAGE`)) return true

  return permissions.includes(`${module}:${action}`)
}

/**
 * Lanza un error si el usuario no tiene el permiso (útil para Server Actions o Rutas)
 */
export async function requirePermission(module: string, action: Action) {
  const isAllowed = await hasPermission(module, action)
  if (!isAllowed) {
    throw new Error(`Acceso denegado. Se requiere el permiso ${action} en el módulo ${module}.`)
  }
}
