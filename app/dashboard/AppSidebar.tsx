// app/dashboard/AppSidebar.tsx
'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Users, LayoutDashboard, Settings, Banknote, ShieldAlert, 
  FileText, Landmark, UserCircle 
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, 
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";

// Configuration objects replace redundant component trees
const NAV_CONFIG = {
  admin: {
    label: "Admin Controls",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Employees", url: "/dashboard/employees", icon: Users },
      { title: "Payroll", url: "/dashboard/payroll", icon: Banknote },
      { title: "Audit Logs", url: "/dashboard/audit", icon: ShieldAlert },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ]
  },
  employee: {
    label: "Self Service",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Payslips", url: "/dashboard/payslips", icon: FileText },
      { title: "Tax Declarations", url: "/dashboard/tax-declarations", icon: Landmark },
      { title: "Profile & Bank", url: "/dashboard/profile", icon: UserCircle },
    ]
  }
};

export function AppSidebar({ role }: { role: 'admin' | 'employee' }) {
  const pathname = usePathname();
  const { label, items } = NAV_CONFIG[role];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
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