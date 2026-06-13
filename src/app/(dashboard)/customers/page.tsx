import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomers } from '@/modules/customers/services/customers.service'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Clientes' }

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; customer_type?: string }>
}

async function CustomersContent({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const page = Number(searchParams.page) || 1
  const { data: customers, count } = await getCustomers({
    search: searchParams.search,
    customer_type: searchParams.customer_type,
    is_active: true,
    page,
    pageSize: 20,
  })

  return (
    <div className="overflow-x-auto">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Razón Social</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">RUC</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Tipo</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Contacto</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Email</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Crédito</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-muted-foreground">
                <Users className="w-10 h-10 opacity-20 mx-auto mb-2" />
                <p className="text-sm">No hay clientes registrados</p>
              </td>
            </tr>
          ) : customers.map((customer, index) => (
            <tr key={customer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
              <td className="py-3 px-6 font-medium text-sm">{customer.business_name}</td>
              <td className="py-3 px-6 text-muted-foreground font-mono text-xs">{customer.ruc || '—'}</td>
              <td className="py-3 px-6 text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {customer.customer_type}
                </span>
              </td>
              <td className="py-3 px-6 text-muted-foreground text-xs">{customer.contact_name || '—'}</td>
              <td className="py-3 px-6 text-muted-foreground text-xs">{customer.email || '—'}</td>
              <td className="py-3 px-6 text-muted-foreground text-xs text-center">{customer.credit_days}d</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <DataTablePagination totalItems={count} />
    </div>
  )
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <PageShell
      registerButton={
        <Button id="create-customer-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
        </Button>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <CustomersContent searchParams={params} />
      </Suspense>
    </PageShell>
  )
}
