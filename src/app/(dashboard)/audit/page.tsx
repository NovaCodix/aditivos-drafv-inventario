import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Shield } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuditLogs } from '@/modules/audit/services/audit.service'
import { Badge } from '@/components/ui/badge'
import { PageShell } from '@/shared/components/layout/page-shell'

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
    <div className="w-full min-w-0 flex flex-col">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">
          <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Tabla</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acción</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Usuario</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Fecha</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Record ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-16 text-muted-foreground">
                <Shield className="w-10 h-10 opacity-20 mx-auto mb-2" />
                <p className="text-sm">No hay registros de auditoría</p>
              </td>
            </tr>
          ) : logs.map((log, index) => (
            <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
              <td className="py-3 px-6 font-mono text-xs">{log.table_name}</td>
              <td className="py-3 px-6 text-center">
                <Badge variant={ACTION_VARIANTS[log.action] || 'outline'}>{log.action}</Badge>
              </td>
              <td className="py-3 px-6 text-muted-foreground text-xs">{log.user?.full_name || log.user_id || 'Sistema'}</td>
              <td className="py-3 px-6 text-muted-foreground text-xs">
                {new Date(log.created_at).toLocaleString('es-PE')}
              </td>
              <td className="py-3 px-6 font-mono text-xs text-muted-foreground">{log.record_id.substring(0, 8)}…</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      </div>
      {/* Pagination */}
      <DataTablePagination totalItems={count} />
    </div>
  )
}

export default async function AuditPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <PageShell>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <AuditContent searchParams={params} />
      </Suspense>
    </PageShell>
  )
}
