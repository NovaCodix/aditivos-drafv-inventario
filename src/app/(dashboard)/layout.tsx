import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { AppHeader } from '@/shared/components/layout/app-header'
import { AppSidebar } from '@/shared/components/layout/app-sidebar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Package } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/shared/types/database.types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border/10"
      >
        {/* Sidebar Header — Logo */}
        <SidebarHeader className="border-b border-sidebar-border/30 px-2 py-0 group-data-[state=collapsed]:p-2 transition-all duration-300 overflow-visible">
          <Link href="/dashboard" className="flex items-center justify-center h-20 w-full transition-all duration-300">
            <img 
              src="/logo-drafv.webp" 
              alt="DRAFV Inventario" 
              className="h-full w-auto object-contain scale-150 origin-center transition-all duration-300 group-data-[state=collapsed]:w-8 group-data-[state=collapsed]:object-contain group-data-[state=collapsed]:scale-125" 
            />
          </Link>
        </SidebarHeader>

        {/* Sidebar Content — Navigation */}
        <SidebarContent className="py-3">
          <AppSidebar />
        </SidebarContent>

        {/* Sidebar Footer — Version */}
        <SidebarFooter className="border-t border-sidebar-border/30 p-4 group-data-[state=collapsed]:p-2 transition-all duration-300">
          <div className="flex items-center justify-center gap-1.5 group-data-[state=collapsed]:justify-center transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <p className="text-sidebar-foreground/35 text-[9px] font-bold tracking-widest uppercase text-center transition-all duration-300 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 group-data-[state=collapsed]:pointer-events-none whitespace-nowrap">
              v1.0.0 · Producción
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset className="bg-background">
        <AppHeader user={profile as Profile | null} />
        <main className="flex-1 p-4 lg:p-6 xl:p-8 animate-fade-in w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
