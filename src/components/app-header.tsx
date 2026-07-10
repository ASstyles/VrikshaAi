"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { NAV_LINKS } from "@/lib/constants";

export function AppHeader() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  const getTitle = () => {
    // For dynamic routes like /herbarium/[slug], we want a different title logic
    if (pathname.startsWith("/herbarium/")) {
      return "Herbarium";
    }

    const currentLink = NAV_LINKS.find((link) => link.href === pathname);
    return currentLink?.label || "";
  };
  
  const title = getTitle();

  if (!isMobile) {
    return (
      <header className="flex h-16 items-center justify-between border-b bg-card px-6">
        <h1 className="font-headline text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {/* Placeholder for potential header actions */}
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sticky top-0 z-30 sm:px-6">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
