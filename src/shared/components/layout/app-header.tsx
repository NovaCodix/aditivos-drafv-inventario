'use client'

import { Maximize, Minimize, Bell, ChevronDown, User, LogOut, Menu, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { getInitials } from '@/shared/lib/utils'
import { signOut } from '@/modules/auth/actions/auth.actions'
import type { Profile } from '@/shared/types/database.types'
import { usePathname } from 'next/navigation'

interface AppHeaderProps {
  user: Profile | null
}

const translateSegment = (segment: string) => {
  const dictionary: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Catálogo',
    categories: 'Categorías',
    brands: 'Marcas',
    'unit-measures': 'Unidades de Medida',
    warehouses: 'Almacenes',
    locations: 'Ubicaciones',
    suppliers: 'Proveedores',
    users: 'Usuarios',
    roles: 'Roles',
    reports: 'Reportes',
    settings: 'Configuración',
    movements: 'Movimientos (Kardex)',
    batches: 'Lotes',
    inventory: 'Stock Actual',
    customers: 'Clientes',
    purchases: 'Órdenes de Compra',
    sales: 'Órdenes de Venta',
    manufacturing: 'Manufactura',
    'bill-of-materials': 'Listas de Materiales',
    'production-orders': 'Órdenes de Producción',
    invoicing: 'Facturación',
    audit: 'Auditoría',
    // Acciones
    new: 'Registrar',
    edit: 'Editar',
    view: 'Ver',
  }
  return dictionary[segment] || segment
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)

  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-white dark:bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Sidebar trigger */}
        <SidebarTrigger className="-ml-1 text-foreground/80 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer" id="sidebar-trigger" />

        {/* Logo (visible en mobile) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shadow-md">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide">DRAFV</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Fullscreen Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="relative hover:bg-muted/50 rounded-lg w-8 h-8 hidden md:inline-flex"
          id="fullscreen-btn"
          title="Pantalla completa"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-foreground/80" />
          ) : (
            <Maximize className="w-4 h-4 text-foreground/80" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted/50 rounded-lg w-8 h-8"
          id="notifications-btn"
        >
          <Bell className="w-4 h-4 text-foreground/80" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </Button>

        <div className="h-4 w-[1px] bg-border/40 hidden md:block" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button
              className="flex items-center gap-2 h-9 px-1.5 hover:bg-muted/40 rounded-lg transition-colors cursor-pointer text-left"
              id="user-menu-btn"
            />
          }>
            <Avatar className="h-7 w-7 border border-border/40 shadow-sm">
              <AvatarFallback className="text-xs gradient-primary text-white font-semibold">
                {user?.full_name ? getInitials(user.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start leading-none gap-0.5">
              <span className="text-xs font-semibold text-foreground max-w-28 truncate">
                {user?.full_name || 'Usuario'}
              </span>
              <span className="text-[9px] text-muted-foreground/65 font-bold uppercase tracking-wider">
                {user?.email?.includes('admin') ? 'Administrador' : 'Personal'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 opacity-40 hidden md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-foreground">{user?.full_name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem id="profile-menu-item" className="cursor-pointer">
              <User className="mr-2 h-4 w-4 opacity-70" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut()}
              id="logout-menu-item"
            >
              <LogOut className="mr-2 h-4 w-4 opacity-70" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
