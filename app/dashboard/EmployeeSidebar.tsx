// app/dashboard/EmployeeSidebar.tsx
'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, Landmark, UserCircle } from "lucide-react";
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
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Payslips", url: "/dashboard/payslips", icon: FileText },
  { title: "Tax Declarations", url: "/dashboard/tax-declarations", icon: Landmark },
  { title: "Profile & Bank", url: "/dashboard/profile", icon: UserCircle },
];

export function EmployeeSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Self Service</SidebarGroupLabel>
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