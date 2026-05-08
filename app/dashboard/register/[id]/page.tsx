import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { user, attendance } from "@/db/schema";
import { and, eq, like } from "drizzle-orm";
import { getCachedSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCircle, Clock } from "lucide-react";
import { formatTime, calculateHoursWorked } from "@/lib/date-utils";

function IndividualRegisterSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-125 w-full rounded-xl" />
    </div>
  );
}

// Data structure for our generated calendar rows
type DailyRecord = {
  dateStr: string;
  dayNum: number;
  dayOfWeek: string;
  isWeekend: boolean;
  record: typeof attendance.$inferSelect | undefined;
};

async function IndividualRegisterData({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const session = await getCachedSession();
  if (session?.user?.role !== "admin") redirect("/dashboard");

  // Next.js 15 requirement: Await params
  const { id: employeeId } = await paramsPromise;

  // 1. Fetch the Target Employee
  const targetEmployee = await db.query.user.findFirst({
    where: eq(user.id, employeeId),
  });

  if (!targetEmployee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Employee Not Found</h2>
        <Button variant="link" nativeButton={false} render={<Link href="/dashboard/register">Go Back</Link>} />
      </div>
    );
  }

  // 2. Setup Current Month Parameters
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth(); // 0-indexed for Date math
  const currentMonthStr = (currentMonthNum + 1).toString().padStart(2, "0");
  const monthPrefix = `${currentYear}-${currentMonthStr}-`;
  const daysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();

  // 3. Fetch ONLY this employee's attendance for the current month
  const monthlyAttendance = await db.query.attendance.findMany({
    where: and(
      eq(attendance.employeeId, employeeId),
      like(attendance.date, `${monthPrefix}%`)
    ),
  });

  // 4. Generate a row for EVERY day of the month (Standard UX pattern)
  const calendarRows: DailyRecord[] = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dayStr = dayNum.toString().padStart(2, "0");
    const dateQueryStr = `${monthPrefix}${dayStr}`;
    const dateObj = new Date(currentYear, currentMonthNum, dayNum);
    const dayOfWeek = dateObj.toLocaleDateString("en-IN", { weekday: "short" });
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    const record = monthlyAttendance.find((a) => a.date === dateQueryStr);

    return { dateStr: dateQueryStr, dayNum, dayOfWeek, isWeekend, record };
  });

  // Calculate some basic stats
  const totalDaysPresent = monthlyAttendance.filter((a) => a.clockIn).length;

  // 5. Define Columns for the Detailed View
  const columns: ColumnDef<DailyRecord>[] = [
    {
      header: "Date",
      className: "w-[120px]",
      cell: (row) => (
        <div className={`font-medium ${row.isWeekend ? "text-muted-foreground" : "text-foreground"}`}>
          {row.dayNum} {row.dayOfWeek}
        </div>
      ),
    },
    {
      header: "Status",
      className: "w-[150px]",
      cell: (row) => {
        if (row.record?.clockIn) {
          // If they haven't clocked out yet but have clocked in
          if (!row.record.clockOut) return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">In Progress</Badge>;
          
          const hrs = calculateHoursWorked(row.record.clockIn, row.record.clockOut, row.record.breakStart, row.record.breakEnd);
          if (hrs >= 8) return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Present</Badge>;
          if (hrs >= 4) return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Half Day</Badge>;
          return <Badge variant="outline" className="text-rose-600 border-rose-200">Invalid Hours</Badge>;
        }
        
        if (row.isWeekend) return <span className="text-xs text-muted-foreground italic">Weekend</span>;
        
        // If it's a past date with no record
        const isPastDate = new Date(row.dateStr) < new Date(new Date().setHours(0,0,0,0));
        return isPastDate ? <Badge variant="destructive">Absent</Badge> : <span className="text-xs text-zinc-400">-</span>;
      },
    },
    {
      header: "Punch In",
      cell: (row) => (row.record?.clockIn ? formatTime(row.record.clockIn) : "-"),
    },
    {
      header: "Punch Out",
      cell: (row) => (row.record?.clockOut ? formatTime(row.record.clockOut) : "-"),
    },
    {
      header: "Total Hrs",
      className: "text-right",
      cell: (row) => {
        if (row.record?.clockIn && row.record?.clockOut) {
          const hrs = calculateHoursWorked(row.record.clockIn, row.record.clockOut, row.record.breakStart, row.record.breakEnd);
          return <span className="font-medium text-zinc-700">{hrs.toFixed(1)}h</span>;
        }
        return "-";
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" nativeButton={false} render={<Link href="/dashboard/register" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
            Register Details
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground capitalize">
            {now.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
        </div>
      </div>

      {/* Employee Context Summary */}
      <Card className="bg-zinc-50 border-zinc-200/60 shadow-sm">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <UserCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-xl font-bold">{targetEmployee.name}</h3>
            <p className="text-sm text-muted-foreground">{targetEmployee.email}</p>
          </div>
          <div className="hidden md:flex gap-6 text-right">
             <div>
                <p className="text-sm font-medium text-muted-foreground">Days Present</p>
                <p className="text-2xl font-bold text-primary">{totalDaysPresent}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Ledger Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-zinc-500" />
            Daily Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={calendarRows} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function IndividualRegisterPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<IndividualRegisterSkeleton />}>
      <IndividualRegisterData paramsPromise={props.params} />
    </Suspense>
  );
}