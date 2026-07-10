"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

const NO_SIDEBAR_ROUTES = ['/', '/login'];

function Content({ children }: { children: React.ReactNode }) {
    const { isMobile } = useSidebar();
    
    return (
        <div className="flex flex-1 flex-col">
            <AppHeader />
            <main className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-6'}`}>
                {children}
            </main>
        </div>
    );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side="left">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <Content>{children}</Content>
      </SidebarInset>
    </SidebarProvider>
  );
}
