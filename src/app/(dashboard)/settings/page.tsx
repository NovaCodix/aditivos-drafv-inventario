import type { Metadata } from 'next'
import { Settings as SettingsIcon, Building2, Globe, DollarSign, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageShell } from '@/shared/components/layout/page-shell'

export const metadata: Metadata = { title: 'Configuración' }

export default function SettingsPage() {
  return (
    <PageShell>
      <div className="page-content grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card id="company-settings">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Información de Empresa</CardTitle>
            </div>
            <CardDescription className="text-xs">Datos generales de la organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Nombre</p>
              <p className="font-medium">Aditivos DRAFV</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Sistema</p>
              <p className="font-medium">Inventario de Aditivos de Concreto v1.0.0</p>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card id="regional-settings">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Configuración Regional</CardTitle>
            </div>
            <CardDescription className="text-xs">Idioma, zona horaria y moneda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Idioma</p>
              <p className="font-medium">Español (Perú)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Zona horaria</p>
              <p className="font-medium">America/Lima (UTC-5)</p>
            </div>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card id="currency-settings">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Moneda</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Moneda principal</p>
              <p className="font-medium">PEN — Soles Peruanos (S/)</p>
            </div>
          </CardContent>
        </Card>

        {/* Version */}
        <Card id="version-settings">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Información del Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Versión</p>
              <p className="font-medium font-mono">v1.0.0</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Stack</p>
              <p className="font-medium text-xs">Next.js 16 · Supabase · TailwindCSS v4</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
