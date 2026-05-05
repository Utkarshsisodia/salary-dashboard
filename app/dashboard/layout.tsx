import { Suspense } from "react";
import { getCachedSession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Skeleton } from "@/components/ui/skeleton";

// 2. Isolate the dynamic Sidebar
async function UserSidebar() {
  const session = await getCachedSession();
  if (!session?.user) redirect("/login");

  return <AppSidebar role={session.user.role as "admin" | "employee"} />;
}

// 3. Isolate the dynamic Header
async function UserHeader() {
  const session = await getCachedSession();
  if (!session?.user) redirect("/login");

  const { name, role } = session.user;

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Portal</h1>
        <p className="text-muted-foreground">Welcome back, {name}</p>
      </div>
      <div className="ml-auto">
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 border">
          {role.toUpperCase()}
        </span>
      </div>
    </>
  );
}

// 4. The main layout is now completely static!
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* The Sidebar Skeleton is pre-rendered at build time */}
      <Suspense fallback={<Skeleton className="w-64 min-h-screen rounded-none" />}>
        <UserSidebar />
      </Suspense>

      <SidebarInset>
        <div className="flex-1 min-h-screen bg-zinc-50 p-8 w-full">
          <div className="mx-auto max-w-5xl space-y-6">
            <header className="flex items-center gap-4 pb-4 border-b">
              <SidebarTrigger />
              
              {/* The Header Skeleton is pre-rendered at build time */}
              <Suspense 
                fallback={
                  <div className="flex justify-between w-full items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                }
              >
                <UserHeader />
              </Suspense>
            </header>

            {/* The child pages already have their own Suspense boundaries! */}
            <main>{children}</main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}