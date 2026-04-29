'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Users, LayoutDashboard, Settings, Banknote } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  // Notice we now point to real URLs
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Employees", url: "/dashboard/employees", icon: Users },
  { title: "Payroll", url: "/dashboard/payroll", icon: Banknote },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Controls</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Determine if this is the currently active page
                const isActive = pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    {/* If active, pointer-events-none disables clicking, and opacity-50 greys it out */}
                    <Link 
                      href={item.url} 
                      className={`w-full block transition-opacity ${isActive ? 'pointer-events-none opacity-50' : 'hover:opacity-80'}`}
                    >
                      <SidebarMenuButton isActive={isActive}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}