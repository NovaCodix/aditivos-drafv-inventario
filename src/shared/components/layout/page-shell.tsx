'use client'

import { usePathname } from 'next/navigation'
import { Home, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ─── Diccionario de rutas → etiquetas legibles ────────────────────────────────
const ROUTE_LABELS: Record<string, { label: string; parent?: string }> = {
  // Inventario
  inventory:           { label: 'Stock Actual',             parent: 'Inventario'  },
  movements:           { label: 'Movimientos (Kardex)',      parent: 'Inventario'  },
  batches:             { label: 'Lotes',                     parent: 'Inventario'  },

  // Productos
  products:            { label: 'Catálogo',                 parent: 'Productos'   },
  categories:          { label: 'Categorías',               parent: 'Productos'   },
  brands:              { label: 'Marcas',                   parent: 'Productos'   },
  'unit-measures':     { label: 'Unidades de Medida',       parent: 'Productos'   },

  // Almacenes
  warehouses:          { label: 'Almacenes',                parent: 'Almacenes'   },
  locations:           { label: 'Ubicaciones',              parent: 'Almacenes'   },

  // Sin sub-módulo
  suppliers:           { label: 'Proveedores'                                      },
  customers:           { label: 'Clientes'                                         },
  purchases:           { label: 'Órdenes de Compra',        parent: 'Compras'     },
  sales:               { label: 'Órdenes de Venta',         parent: 'Ventas'      },
  manufacturing:       { label: 'Resumen',                  parent: 'Manufactura' },
  'bill-of-materials': { label: 'Listas de Materiales',     parent: 'Manufactura' },
  'production-orders': { label: 'Órdenes de Producción',   parent: 'Manufactura' },
  invoicing:           { label: 'Facturación'                                      },
  users:               { label: 'Usuarios',                 parent: 'Usuarios'    },
  roles:               { label: 'Roles',                    parent: 'Usuarios'    },
  reports:             { label: 'Reportes'                                         },
  audit:               { label: 'Auditoría'                                        },
  settings:            { label: 'Configuración'                                    },
  dashboard:           { label: 'Dashboard'                                        },
}

const ACTION_LABELS: Record<string, string> = {
  new:    'Registrar',
  edit:   'Editar',
  view:   'Ver',
  create: 'Registrar',
}

interface BreadcrumbItem {
  label: string
  href?: string
  isIcon?: boolean
}

function buildBreadcrumb(segments: string[]): BreadcrumbItem[] {
  // Solo ícono de inicio, sin texto
  const crumbs: BreadcrumbItem[] = [{ label: 'Inicio', href: '/dashboard', isIcon: true }]

  if (segments.length === 0) return crumbs

  const [module, ...rest] = segments
  const info = ROUTE_LABELS[module]

  if (!info) {
    crumbs.push({ label: module })
    return crumbs
  }

  // Si tiene padre, agregarlo
  if (info.parent) {
    crumbs.push({ label: info.parent })
  }

  // El módulo propio
  const isLastSegment = rest.length === 0
  crumbs.push({ label: info.label, href: isLastSegment ? undefined : `/${module}` })

  // Segmentos adicionales (new, edit, [id], etc.)
  for (let i = 0; i < rest.length; i++) {
    const seg = rest[i]
    const actionLabel = ACTION_LABELS[seg]
    if (actionLabel) {
      crumbs.push({ label: actionLabel })
    }
  }

  return crumbs
}

/** Título de la vista actual */
function getViewLabel(segments: string[]): string {
  if (segments.length === 0) return ''
  const [module, ...rest] = segments
  const info = ROUTE_LABELS[module]
  const baseLabel = info?.label ?? module

  if (rest.length === 0) return `Lista de ${baseLabel}`

  const lastSeg = rest[rest.length - 1]
  const actionLabel = ACTION_LABELS[lastSeg]
  if (actionLabel) return `${actionLabel} ${baseLabel}`

  return baseLabel
}

/** Etiqueta interna del card: "Listar", "Registrar", "Editar" */
function getInternalLabel(segments: string[]): string {
  if (segments.length === 0) return 'Listar'
  const [, ...rest] = segments
  if (rest.length === 0) return 'Listar'
  const lastSeg = rest[rest.length - 1]
  return ACTION_LABELS[lastSeg] ?? 'Listar'
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PageShellProps {
  /** Nodo del botón Registrar — se mostrará DENTRO del card, en la cabecera */
  registerButton?: React.ReactNode
  /** Contenido del área blanca (filtros + tabla) */
  children: React.ReactNode
  /** Clase extra para el contenedor externo */
  className?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function PageShell({
  registerButton,
  children,
  className,
}: PageShellProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const breadcrumbs = buildBreadcrumb(segments)
  const pageTitle   = getViewLabel(segments)
  const internalLabel = getInternalLabel(segments)

  return (
    <div className={cn('space-y-3 w-full max-w-full overflow-hidden', className)}>

      {/* ── Cabecera exterior (título izq. + breadcrumb der.) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2 sm:gap-0 items-start">
        <h1 className="text-xl font-bold tracking-tight text-foreground truncate w-full sm:w-auto">
          {pageTitle}
        </h1>

        {/* Breadcrumb (solo derecha, sin botón aquí) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-muted-foreground/70 font-medium overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            return (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && (
                  <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
                )}
                {crumb.isIcon ? (
                  crumb.href ? (
                    <Link href={crumb.href} className="hover:text-foreground transition-colors">
                      <Home className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Home className="w-3.5 h-3.5" />
                  )
                ) : crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'whitespace-nowrap',
                      isLast && 'text-foreground font-semibold'
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            )
          })}
        </nav>
      </div>

      {/* ── Área blanca (card con cabecera interna + filtros + tabla) ── */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden w-full min-w-0">

        {/* Cabecera interna: "Listar" / "Registrar" / "Editar"  +  botón de acción */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          <span className="text-sm font-semibold text-foreground/80 tracking-tight">
            {internalLabel}
          </span>
          {registerButton && (
            <div>{registerButton}</div>
          )}
        </div>

        {/* Contenido (filtros + tabla) — el padding lo gestionan los hijos directamente */}
        <div className="overflow-hidden">
          {children}
        </div>
      </div>

    </div>
  )
}
