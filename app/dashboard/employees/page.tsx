import { Suspense } from "react";
import { db } from "@/db";
import { user, salaries } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils";
import { EmployeeRowActions } from "./EmployeeRowActions";
import { AssignSalaryModal } from "../AssignSalaryModal";
import { DataTable, ColumnDef } from "@/components/DataTable";

function EmployeesSkeleton() {
  return <Skeleton className="h-150 w-full rounded-xl" />;
}

const PAGE_SIZE = 10;

// Type definition for our specific query structure
type EmployeeWithSalaries = typeof user.$inferSelect & {
  salaries: typeof salaries.$inferSelect[];
};

// Define columns declaratively
const columns: ColumnDef<EmployeeWithSalaries>[] = [
  {
    header: "Employee",
    cell: (emp) => (
      <div>
        <div className="font-medium">{emp.name}</div>
        <div className="text-xs text-muted-foreground">{emp.email}</div>
      </div>
    ),
  },
  {
    header: "Role",
    cell: (emp) => (
      <div className="capitalize">
        {emp.role === "admin" ? (
          <Badge variant="destructive">Admin</Badge>
        ) : (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Employee
          </Badge>
        )}
      </div>
    ),
  },
  {
    header: "Current Salary",
    cell: (emp) => {
      const currentSalary = emp.salaries?.[0];
      return currentSalary ? (
        <span className="font-semibold text-emerald-600">
          {formatINR(currentSalary.baseAmount)}
        </span>
      ) : (
        <span className="text-zinc-400 italic text-sm">Not Assigned</span>
      );
    },
  },
  {
    header: "",
    className: "w-12.5 text-right",
    cell: (emp) => <EmployeeRowActions employeeId={emp.id} />,
  },
];

async function EmployeesData({
  searchParamsPromise,
}: {
  // Update to handle both page and assignId parameters
  searchParamsPromise: Promise<{ assignId?: string; page?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const assignId = searchParams.assignId;

  const rawPage = Number(searchParams.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (page - 1) * PAGE_SIZE;

  // Run queries concurrently
  const [data, totalCountResult] = await Promise.all([
    db.query.user.findMany({
      orderBy: [desc(user.createdAt)],
      limit: PAGE_SIZE,
      offset: offset,
      with: {
        salaries: {
          orderBy: [desc(salaries.effectiveDate), desc(salaries.createdAt)],
          limit: 1, // We only need the most recent salary for this view
        },
      },
    }),
    db.select({ count: count() }).from(user),
  ]);

  const totalRecords = totalCountResult[0].count;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;

  // Find the selected employee for the modal (if an ID is present)
  // Note: If they click an edit button on page 2, the user is in the `data` array.
  const selectedEmployee = assignId ? data.find((e) => e.id === assignId) : null;

  return (
    <div className="space-y-6">
      {/* Look how clean this is without the Card wrappers! */}
      <DataTable
        data={data}
        columns={columns}
        currentPage={page}
        totalPages={totalPages}
        basePath="/dashboard/employees"
      />

      {selectedEmployee && (
        <AssignSalaryModal
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
        />
      )}
    </div>
  );
}

export default function EmployeesPage(props: {
  searchParams: Promise<{ assignId?: string; page?: string }>;
}) {
  return (
    <Suspense fallback={<EmployeesSkeleton />}>
      <EmployeesData searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}