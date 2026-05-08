import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { getCachedSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarSearch } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 10;

function RegisterIndexSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="space-y-2 w-1/3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 rounded-xl" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type EmployeeRow = typeof user.$inferSelect;

const columns: ColumnDef<EmployeeRow>[] = [
  {
    header: "Employee",
    cell: (emp) => (
      <div>
        <div className="font-medium text-foreground">{emp.name}</div>
        <div className="text-xs text-muted-foreground">{emp.email}</div>
      </div>
    ),
  },
  {
    header: "System Role",
    cell: (emp) => (
      <div className="capitalize">
        {emp.role === "admin" ? (
          <Badge variant="destructive">Admin</Badge>
        ) : (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Employee</Badge>
        )}
      </div>
    ),
  },
  {
    header: "Joined Date",
    cell: (emp) => (
      <span className="text-sm text-muted-foreground">
        {new Date(emp.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
      </span>
    ),
  },
  {
    header: "",
    className: "text-right w-24",
    cell: (emp) => (
      <Button
        variant="ghost"
        size="sm"
        className="text-primary hover:text-primary/80"
        nativeButton={false}
        render={
          <Link href={`/dashboard/register/${emp.id}`}>
            <CalendarSearch className="mr-2 h-4 w-4" />
            View Register
          </Link>
        }
      />
    ),
  },
];

async function RegisterIndexData({ searchParamsPromise }: { searchParamsPromise: Promise<{ page?: string }> }) {
  const session = await getCachedSession();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const searchParams = await searchParamsPromise;
  const rawPage = Number(searchParams.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (page - 1) * PAGE_SIZE;

  // Run the data and count queries concurrently
  const [data, totalCountResult] = await Promise.all([
    db.query.user.findMany({
      orderBy: [desc(user.createdAt)],
      limit: PAGE_SIZE,
      offset: offset,
    }),
    db.select({ count: count() }).from(user),
  ]);

  const totalRecords = totalCountResult[0].count;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Employee Register Directory</CardTitle>
        <CardDescription>
          Select an employee to view their detailed daily attendance records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={data}
          columns={columns}
          currentPage={page}
          totalPages={totalPages}
          basePath="/dashboard/register"
        />
      </CardContent>
    </Card>
  );
}

export default function RegisterIndexPage(props: { searchParams: Promise<{ page?: string }> }) {
  return (
    <Suspense fallback={<RegisterIndexSkeleton />}>
      <RegisterIndexData searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}