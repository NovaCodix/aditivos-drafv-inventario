'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/shared/lib/supabase/server'

export async function createUserAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const roleId = formData.get('role_id') as string

  if (!email || !password || !fullName) {
    return { success: false, error: 'Todos los campos son requeridos' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  const userId = data.user?.id
  if (userId) {
    await supabase
      .from('profiles')
      .update({ full_name: fullName } as any)
      .eq('id', userId)

    if (roleId) {
      await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId } as any)
    }
  }

  revalidatePath('/users')
  return { success: true }
}

export async function updateUserAction(id: string, formData: FormData) {
  const fullName = formData.get('full_name') as string
  const roleId = formData.get('role_id') as string
  const isActive = formData.get('is_active') === 'true'

  const supabase = await createClient()

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName, is_active: isActive } as any)
    .eq('id', id)

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  if (roleId) {
    await supabase.from('user_roles').delete().eq('user_id', id)
    await supabase.from('user_roles').insert({ user_id: id, role_id: roleId } as any)
  }

  revalidatePath('/users')
  return { success: true }
}

export async function toggleUserStatusAction(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive } as any)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/users')
  return { success: true }
}
