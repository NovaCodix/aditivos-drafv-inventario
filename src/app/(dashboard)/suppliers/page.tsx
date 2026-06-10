import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Plus, Truck, Phone, Mail, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSuppliers } from '@/modules/suppliers/services/suppliers.service'

export const metadata: Metadata = { title: 'Proveedores' }

async function SuppliersContent() {
  const { data: suppliers } = await getSuppliers({ pageSize: 50 })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {suppliers.length === 0 ? (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          <Truck className="w-10 h-10 opacity-20 mx-auto mb-2" />
          <p className="text-sm">No hay proveedores registrados</p>
        </div>
      ) : (
        suppliers.map(supplier => (
          <Card
            key={supplier.id}
            className="hover:shadow-md transition-all"
            id={`supplier-${supplier.id}`}
          >
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <Badge
                  variant={supplier.is_active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {supplier.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <h3 className="font-semibold text-sm leading-tight">{supplier.business_name}</h3>
              {supplier.ruc && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">RUC: {supplier.ruc}</p>
              )}

              <div className="space-y-1.5 mt-3">
                {supplier.contact_name && (
                  <p className="text-xs text-muted-foreground">{supplier.contact_name}</p>
                )}
                {supplier.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {supplier.phone}
                  </p>
                )}
                {supplier.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </p>
                )}
                {supplier.city && (
                  <p className="text-xs text-muted-foreground">📍 {supplier.city}, {supplier.country}</p>
                )}
              </div>

              {supplier.credit_days && supplier.credit_days > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Crédito: <span className="font-medium text-foreground">{supplier.credit_days} días</span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" render={<a href={`/suppliers/${supplier.id}/edit`} id={`edit-supplier-${supplier.id}`} />}>
                    Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export default function SuppliersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de proveedores de aditivos</p>
        </div>
        <Button id="create-supplier-btn" className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      }>
        <SuppliersContent />
      </Suspense>
    </div>
  )
}
