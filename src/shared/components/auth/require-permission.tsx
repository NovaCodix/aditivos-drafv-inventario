import { hasPermission, type Action } from '@/modules/auth/services/rbac.service'
import { ReactNode } from 'react'

interface RequirePermissionProps {
  module: string
  action: Action
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente Server-Side que renderiza sus hijos solo si el usuario tiene el permiso requerido.
 * Utiliza React cache() internamente (vía hasPermission) por lo que es eficiente aunque se use múltiples veces.
 */
export async function RequirePermission({
  module,
  action,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const isAllowed = await hasPermission(module, action)

  if (!isAllowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
