import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar"; // <-- Replaced imports
import { logOut } from "./actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { role, name } = session.user;

  return (
    <SidebarProvider>
      {/* Conditionally render using a single component */}
      <AppSidebar role={role} />

      <SidebarInset>
        <div className="flex-1 min-h-screen bg-zinc-50 p-8 w-full">
          <div className="mx-auto max-w-5xl space-y-6">
            <header className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-4">
                {/* Ensure the trigger shows for both roles on mobile/desktop */}
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Company Portal
                  </h1>
                  <p className="text-muted-foreground">Welcome back, {name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 border">
                  {role.toUpperCase()}
                </span>
                <form action={logOut}>
                  <Button variant="outline" size="sm" type="submit">
                    Sign Out
                  </Button>
                </form>
              </div>
            </header>

            {/* This is where the specific pages will render! */}
            <main>{children}</main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
