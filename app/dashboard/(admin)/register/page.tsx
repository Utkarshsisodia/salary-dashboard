import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarSearch } from "lucide-react";
import Link from "next/link";
import Loading from "./loading"
const PAGE_SIZE = 10;
type EmployeeRow = typeof user.$inferSelect;

// 1. Change columns to a function that accepts the currentPage
const getColumns = (currentPage: number): ColumnDef<EmployeeRow>[] => [
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
          // 2. Append the current page to the URL as a `from` parameter
          <Link href={`/dashboard/register/${emp.id}?from=${currentPage}`}>
            <CalendarSearch className="mr-2 h-4 w-4" />
            View Register
          </Link>
        }
      />
    ),
  },
];  

async function RegisterIndexData({ searchParams }: { searchParams: { page?: string } }) {
  await requireAdmin();
  const rawPage = Number(searchParams.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (page - 1) * PAGE_SIZE;

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
          columns={getColumns(page)} // 3. Pass the current page into the column generator
          currentPage={page}
          totalPages={totalPages}
          basePath="/dashboard/register"
        />
      </CardContent>
    </Card>
  );
}

async function RegisterDataLoader({ searchParamsPromise }: { searchParamsPromise: Promise<{ page?: string }> }) {
  const searchParams = await searchParamsPromise;
  const currentPage = searchParams.page || "1";

  return (
    <Suspense key={currentPage} fallback={<Loading />}>
      <RegisterIndexData searchParams={searchParams} />
    </Suspense>
  );
}

export default function RegisterIndexPage(props: { searchParams: Promise<{ page?: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <RegisterDataLoader searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}