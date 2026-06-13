import { DataTablePagination } from '@/components/ui/data-table-pagination'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, Truck, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { getSuppliers } from '@/modules/suppliers/services/suppliers.service'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Proveedores' }

async function SuppliersContent() {
  const { data: suppliers } = await getSuppliers({ pageSize: 50 })

  return (
    <div className="overflow-x-auto">
      <div className="px-4 md:px-6 pt-2 pb-4">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">#</th>
            <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Razón Social</th>
            <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">RUC</th>
            <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Contacto</th>
            <th className="text-left py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Ciudad</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Crédito (días)</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Estado</th>
            <th className="text-center py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-muted-foreground">
                <Truck className="w-10 h-10 opacity-20 mx-auto mb-2" />
                <p className="text-sm">No hay proveedores registrados</p>
              </td>
            </tr>
          ) : (
            suppliers.map((supplier, index) => (
              <tr
                key={supplier.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                id={`supplier-${supplier.id}`}
              >
                <td className="py-3 px-4 text-center font-medium text-xs text-muted-foreground">{index + 1}</td>
                <td className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{supplier.business_name}</p>
                      {supplier.contact_name && (
                        <p className="text-[10px] text-muted-foreground">{supplier.contact_name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-6 text-xs font-mono text-muted-foreground">
                  {supplier.ruc || '—'}
                </td>
                <td className="py-3 px-6">
                  <div className="space-y-0.5">
                    {supplier.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3 shrink-0" /> {supplier.phone}
                      </p>
                    )}
                    {supplier.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 max-w-[160px] truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </p>
                    )}
                    {!supplier.phone && !supplier.email && <span className="text-xs text-muted-foreground/60">—</span>}
                  </div>
                </td>
                <td className="py-3 px-6 text-xs text-muted-foreground">
                  {supplier.city ? `📍 ${supplier.city}, ${supplier.country}` : '—'}
                </td>
                <td className="py-3 px-6 text-center text-xs">
                  {supplier.credit_days && supplier.credit_days > 0 ? (
                    <span className="font-medium">{supplier.credit_days} días</span>
                  ) : '—'}
                </td>
                <td className="py-3 px-6 text-center">
                  <Badge variant={supplier.is_active ? 'default' : 'secondary'} className="text-xs">
                    {supplier.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="py-3 px-6 text-center">
                  <Button variant="outline" size="sm" className="h-7 text-xs" render={<a href={`/suppliers/${supplier.id}/edit`} id={`edit-supplier-${supplier.id}`} />}>
                      Editar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      {/* Pagination */}
      <DataTablePagination totalItems={suppliers.length} />
    </div>
  )
}

export default function SuppliersPage() {
  return (
    <PageShell
      registerButton={
        <Button id="create-supplier-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      }
    >
      <Suspense fallback={
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      }>
        <SuppliersContent />
      </Suspense>
    </PageShell>
  )
}
