"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "./logo";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/login');
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {NAV_LINKS.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton
                  isActive={isActive(link.href)}
                  tooltip={{ children: link.label, side: "right", align: "center" }}
                >
                  <link.icon className="shrink-0" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid || 'user'}/100/100`} alt="User" />
            <AvatarFallback>{user?.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden text-sm">
            <span className="font-medium truncate">{user?.displayName ?? 'Guest User'}</span>
            <span className="text-muted-foreground truncate">{user?.email ?? 'guest@vriksha.life'}</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto shrink-0" onClick={handleLogout}>
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
