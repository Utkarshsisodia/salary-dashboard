// app/dashboard/AppSidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users,
  LayoutDashboard,
  Settings,
  Banknote,
  ShieldAlert,
  Clock,
} from "lucide-react";
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

const NAV_CONFIG = {
  admin: {
    label: "Admin Controls",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Employees", url: "/dashboard/employees", icon: Users },
      { title: "Payroll", url: "/dashboard/payroll", icon: Banknote },
      { title: "Audit Logs", url: "/dashboard/audit", icon: ShieldAlert },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
  employee: {
    label: "Self Service",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Attendance", url: "/dashboard/attendance", icon: Clock },
    ],
  },
};

export function AppSidebar({ role }: { role: "admin" | "employee" }) {
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
                      className={`w-full block transition-opacity ${isActive ? "pointer-events-none opacity-50" : "hover:opacity-80"}`}
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
