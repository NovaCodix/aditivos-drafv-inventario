import type { Metadata } from 'next'
import { FileBarChart, TrendingUp, Package, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Reportes' }

const reports = [
  {
    id: 'stock-report',
    title: 'Reporte de Stock',
    description: 'Estado actual del inventario por producto y almacén',
    icon: Package,
    href: '/reports/stock',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'movements-report',
    title: 'Reporte de Movimientos',
    description: 'Kardex completo con entradas, salidas y ajustes',
    icon: TrendingUp,
    href: '/reports/movements',
    color: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'suppliers-report',
    title: 'Reporte de Proveedores',
    description: 'Lista de proveedores activos con información de contacto',
    icon: Truck,
    href: '/reports/suppliers',
    color: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'expiration-report',
    title: 'Lotes por Vencer',
    description: 'Aditivos con fecha de vencimiento próxima o vencidos',
    icon: FileBarChart,
    href: '/reports/expiration',
    color: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
]

export default function ReportsPage() {
  return (
    <PageShell>
      <div className="page-content grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(report => (
          <Link key={report.id} href={report.href}>
            <Card
              className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group"
              id={report.id}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${report.color}`}>
                    <report.icon className={`w-5 h-5 ${report.iconColor}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  )
}
