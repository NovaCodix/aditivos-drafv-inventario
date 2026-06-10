import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomers } from '@/modules/customers/services/customers.service'

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
    <div className="rounded-xl border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left p-3 font-semibold">Razón Social</th>
            <th className="text-left p-3 font-semibold">RUC</th>
            <th className="text-left p-3 font-semibold">Tipo</th>
            <th className="text-left p-3 font-semibold">Contacto</th>
            <th className="text-left p-3 font-semibold">Email</th>
            <th className="text-left p-3 font-semibold">Crédito</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground">
                No hay clientes registrados
              </td>
            </tr>
          ) : customers.map(customer => (
            <tr key={customer.id} className="border-b hover:bg-muted/20 transition-colors">
              <td className="p-3 font-medium">{customer.business_name}</td>
              <td className="p-3 text-muted-foreground">{customer.ruc || '—'}</td>
              <td className="p-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {customer.customer_type}
                </span>
              </td>
              <td className="p-3 text-muted-foreground">{customer.contact_name || '—'}</td>
              <td className="p-3 text-muted-foreground">{customer.email || '—'}</td>
              <td className="p-3 text-muted-foreground">{customer.credit_days}d</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3 text-xs text-muted-foreground border-t">
        {count} cliente{count !== 1 ? 's' : ''} en total
      </div>
    </div>
  )
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de cartera de clientes</p>
        </div>
        <Button id="create-customer-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <CustomersContent searchParams={params} />
      </Suspense>
    </div>
  )
}
