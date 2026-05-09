import { Suspense } from "react";
import { db } from "@/db";
import { user, salaries } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { EmployeeRowActions } from "./EmployeeRowActions";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { AssignSalaryModal } from "../../AssignSalaryModal";
import Loading from "./loading";
import { requireAdmin } from "@/lib/session";

const PAGE_SIZE = 10;

type EmployeeWithSalaries = typeof user.$inferSelect & {
  salaries: typeof salaries.$inferSelect[];
};

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

// 3. The actual data fetcher receives the unwrapped params
async function EmployeesData({
  searchParams,
}: {
  searchParams: { assignId?: string; page?: string };
}) {
  await requireAdmin();
  const assignId = searchParams.assignId;
  const rawPage = Number(searchParams.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (page - 1) * PAGE_SIZE;

  const [data, totalCountResult] = await Promise.all([
    db.query.user.findMany({
      orderBy: [desc(user.createdAt)],
      limit: PAGE_SIZE,
      offset: offset,
      with: {
        salaries: {
          orderBy: [desc(salaries.effectiveDate), desc(salaries.createdAt)],
          limit: 1,
        },
      },
    }),
    db.select({ count: count() }).from(user),
  ]);

  const totalRecords = totalCountResult[0].count;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;

  const selectedEmployee = assignId ? data.find((e) => e.id === assignId) : null;

  return (
    <div className="space-y-6">
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

// 2. The Loader unwraps the promise safely INSIDE a suspense boundary
async function EmployeesDataLoader({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ assignId?: string; page?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const currentPage = searchParams.page || "1";

  return (
    // This inner boundary triggers the skeleton on pagination!
    <Suspense key={currentPage} fallback={<Loading />}>
      <EmployeesData searchParams={searchParams} />
    </Suspense>
  );
}

// 1. Top level page is completely synchronous and non-blocking
export default function EmployeesPage(props: {
  searchParams: Promise<{ assignId?: string; page?: string }>;
}) {
  return (
    // Outer boundary catches the promise unwrap
    <Suspense fallback={<Loading />}>
      <EmployeesDataLoader searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}