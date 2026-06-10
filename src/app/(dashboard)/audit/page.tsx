import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Shield } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuditLogs } from '@/modules/audit/services/audit.service'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Auditoría' }

const ACTION_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  INSERT: 'default',
  UPDATE: 'secondary',
  DELETE: 'destructive',
}

interface PageProps {
  searchParams: Promise<{ table_name?: string; action?: string; page?: string }>
}

async function AuditContent({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1
  const { data: logs, count } = await getAuditLogs({
    table_name: searchParams.table_name,
    action: searchParams.action as any,
    page,
    pageSize: 50,
  })

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left p-3 font-semibold">Tabla</th>
            <th className="text-left p-3 font-semibold">Acción</th>
            <th className="text-left p-3 font-semibold">Usuario</th>
            <th className="text-left p-3 font-semibold">Fecha</th>
            <th className="text-left p-3 font-semibold">Record ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-12 text-muted-foreground">
                No hay registros de auditoría
              </td>
            </tr>
          ) : logs.map(log => (
            <tr key={log.id} className="border-b hover:bg-muted/20 transition-colors">
              <td className="p-3 font-mono text-xs">{log.table_name}</td>
              <td className="p-3">
                <Badge variant={ACTION_VARIANTS[log.action] || 'outline'}>{log.action}</Badge>
              </td>
              <td className="p-3 text-muted-foreground">{log.user?.full_name || log.user_id || 'Sistema'}</td>
              <td className="p-3 text-muted-foreground text-xs">
                {new Date(log.created_at).toLocaleString('es-PE')}
              </td>
              <td className="p-3 font-mono text-xs text-muted-foreground">{log.record_id.substring(0, 8)}…</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3 text-xs text-muted-foreground border-t">{count} evento{count !== 1 ? 's' : ''} registrados</div>
    </div>
  )
}

export default async function AuditPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría</h1>
          <p className="text-muted-foreground text-sm mt-1">Registro de todas las operaciones del sistema</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          Solo lectura · Append-only
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <AuditContent searchParams={params} />
      </Suspense>
    </div>
  )
}
