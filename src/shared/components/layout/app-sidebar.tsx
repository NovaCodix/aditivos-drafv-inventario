'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  BarChart3,
  Truck,
  Users,
  FileBarChart,
  Settings,
  ChevronRight,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  Factory,
  FileText,
  Shield,
  ClipboardList,
  Layers,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'

type NavItem = {
  title: string
  href?: string
  icon: React.ElementType
  badge?: string
  children?: { title: string; href: string }[]
}

// ─── Módulos originales ───────────────────────────────────────────────────────
const coreNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Inventario',
    icon: BarChart3,
    children: [
      { title: 'Stock Actual', href: '/inventory' },
      { title: 'Movimientos (Kardex)', href: '/movements' },
      { title: 'Lotes', href: '/batches' },
    ],
  },
  {
    title: 'Productos',
    icon: Package,
    children: [
      { title: 'Catálogo', href: '/products' },
      { title: 'Categorías', href: '/categories' },
      { title: 'Marcas', href: '/brands' },
      { title: 'Unidades', href: '/unit-measures' },
    ],
  },
  {
    title: 'Almacenes',
    icon: Warehouse,
    children: [
      { title: 'Almacenes', href: '/warehouses' },
      { title: 'Ubicaciones', href: '/locations' },
    ],
  },
  {
    title: 'Proveedores',
    href: '/suppliers',
    icon: Truck,
  },
]

// ─── Módulos ERP ──────────────────────────────────────────────────────────────
const erpNavItems: NavItem[] = [
  {
    title: 'Clientes',
    href: '/customers',
    icon: UserCheck,
  },
  {
    title: 'Compras',
    icon: ShoppingCart,
    children: [
      { title: 'Órdenes de Compra', href: '/purchases' },
    ],
  },
  {
    title: 'Ventas',
    icon: TrendingUp,
    children: [
      { title: 'Órdenes de Venta', href: '/sales' },
    ],
  },
  {
    title: 'Manufactura',
    icon: Factory,
    children: [
      { title: 'Resumen', href: '/manufacturing' },
      { title: 'Listas de Materiales', href: '/bill-of-materials' },
      { title: 'Órdenes de Producción', href: '/production-orders' },
    ],
  },
  {
    title: 'Facturación',
    href: '/invoicing',
    icon: FileText,
  },
]

// ─── Administración ───────────────────────────────────────────────────────────
const adminNavItems: NavItem[] = [
  {
    title: 'Usuarios',
    icon: Users,
    children: [
      { title: 'Usuarios', href: '/users' },
      { title: 'Roles', href: '/roles' },
    ],
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: FileBarChart,
  },
  {
    title: 'Auditoría',
    href: '/audit',
    icon: Shield,
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
]

function NavItemComponent({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const { setOpenMobile, isMobile } = useSidebar()
  const [isOpen, setIsOpen] = useState(() => {
    if (item.children) {
      return item.children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'))
    }
    return false
  })

  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + '/') : false

  if (item.children) {
    const isChildActive = item.children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'))
    return (
      <SidebarMenuItem className="mb-0.5">
        <SidebarMenuButton
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full justify-between cursor-pointer rounded-lg transition-all duration-300 px-3 py-2 text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50',
            isChildActive && 'text-sidebar-primary font-semibold bg-sidebar-accent/30 text-white'
          )}
          id={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <span className="flex items-center gap-2.5">
            <item.icon className={cn("w-4 h-4 transition-transform duration-300", isChildActive ? "text-sidebar-primary" : "opacity-80")} />
            <span className="transition-all duration-300 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:pointer-events-none whitespace-nowrap overflow-hidden">
              {item.title}
            </span>
          </span>
          <ChevronRight className={cn("w-3.5 h-3.5 opacity-60 transition-all duration-300 ease-in-out group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:pointer-events-none", isOpen && "rotate-90")} />
        </SidebarMenuButton>
        
        {/* Despliegue animado mediante CSS Grid (0fr -> 1fr) */}
        <div className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}>
          <div className="overflow-hidden">
            <SidebarMenuSub className="mt-1 flex flex-col gap-0.5 border-l border-sidebar-border/30 ml-4.5 pl-3 py-1">
              {item.children.map(child => {
                const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
                return (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      onClick={() => {
                        if (isMobile) setOpenMobile(false)
                      }}
                      render={<Link href={child.href} />}
                      isActive={childActive}
                      className={cn(
                        "transition-all duration-200 rounded-lg py-1 px-2.5 text-sidebar-foreground/75 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/40 text-[13px]",
                        childActive && "text-white font-medium bg-sidebar-primary/20! hover:bg-sidebar-primary/25!"
                      )}
                      id={`nav-${child.href.replace(/\//g, '').replace(/-/g, '_')}`}
                    >
                      {child.title}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </div>
        </div>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem className="mb-0.5">
      <SidebarMenuButton
        onClick={() => {
          if (isMobile) setOpenMobile(false)
        }}
        render={<Link href={item.href!} className="flex items-center gap-2.5" />}
        isActive={isActive}
        className={cn(
          'transition-all duration-300 rounded-lg px-3 py-2 text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50',
          isActive && 'text-white font-semibold bg-sidebar-primary/20! hover:bg-sidebar-primary/25!'
        )}
        id={`nav-${item.href?.replace(/\//g, '') || item.title.toLowerCase()}`}
      >
        <item.icon className={cn("w-4 h-4 transition-transform duration-300", isActive ? "text-sidebar-primary" : "opacity-80")} />
        <span className="transition-all duration-300 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:pointer-events-none whitespace-nowrap overflow-hidden">
          {item.title}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  return (
    <div className="flex flex-col gap-1">
      {/* Módulos Core */}
      <SidebarGroup className="px-2">
        <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] uppercase font-bold tracking-widest px-3 mb-2">
          Inventario
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            {coreNavItems.map(item => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Módulos ERP */}
      <SidebarGroup className="px-2">
        <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] uppercase font-bold tracking-widest px-3 mb-2">
          Comercial / ERP
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            {erpNavItems.map(item => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Administración */}
      <SidebarGroup className="px-2">
        <SidebarGroupLabel className="text-sidebar-foreground/35 text-[10px] uppercase font-bold tracking-widest px-3 mb-2">
          Administración
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            {adminNavItems.map(item => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
