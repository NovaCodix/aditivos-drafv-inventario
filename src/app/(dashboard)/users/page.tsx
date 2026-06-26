import type { Metadata } from 'next'
import { createClient } from '@/shared/lib/supabase/server'
import { UsersClient } from '@/modules/users/components/users-client'

export const metadata: Metadata = { title: 'Usuarios' }

export default async function UsersPage() {
  const supabase = await createClient()

  const [profilesRes, rolesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select(`
        *,
        user_roles!user_id(
          role:roles(id, name)
        )
      `)
      .order('full_name'),
    supabase
      .from('roles')
      .select('id, name')
      .order('name')
  ])

  const profiles = profilesRes.data || []
  const roles = rolesRes.data || []

  return (
    <UsersClient initialUsers={profiles as any} roles={roles} />
  )
}
