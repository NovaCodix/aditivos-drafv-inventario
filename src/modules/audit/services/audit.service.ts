import { createClient } from '@/shared/lib/supabase/server'
import type { AuditLog } from '@/shared/types/database.types'

export interface AuditFilters {
  table_name?: string
  action?: string
  user_id?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
}

export async function getAuditLogs(filters: AuditFilters = {}) {
  const supabase = await createClient()
  const { table_name, action, user_id, date_from, date_to, page = 1, pageSize = 50 } = filters

  let query = supabase
    .from('audit_logs')
    .select(`*, user:profiles(id, full_name, email)`, { count: 'exact' })

  if (table_name) query = query.eq('table_name', table_name)
  if (action) query = query.eq('action', action)
  if (user_id) query = query.eq('user_id', user_id)
  if (date_from) query = query.gte('created_at', date_from)
  if (date_to) query = query.lte('created_at', date_to + 'T23:59:59')

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return {
    data: (data || []) as Array<AuditLog & { user: any }>,
    count: count || 0,
  }
}

export async function getAuditLogsByRecord(tableName: string, recordId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`*, user:profiles(id, full_name)`)
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []) as Array<AuditLog & { user: any }>
}
