import { Suspense } from "react";
import { db } from "@/db";
import { auditLogs, user } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, ColumnDef } from "@/components/DataTable";

function AuditSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        {/* Mock Table Header */}
        <div className="flex items-center p-3 border-b bg-zinc-50/50 dark:bg-zinc-900/50 gap-4">
          <Skeleton className="h-4 w-50" />
          <Skeleton className="h-4 w-50" />
          <Skeleton className="h-4 w-37.5" />
          <Skeleton className="h-4 w-full max-w-75" />
        </div>
        {/* Mock Table Rows (PAGE_SIZE = 15) */}
        <div className="divide-y">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex items-center p-3 gap-4">
              <div className="w-50">
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="w-50">
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="w-37.5">
                <Skeleton className="h-5 w-24 rounded-3xl" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-full max-w-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Mock Pagination */}
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-4xl" />
          <Skeleton className="h-8 w-20 rounded-4xl" />
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 15;

const getBadgeVariant = (actionType: string) => {
  if (actionType.includes("CREATE") || actionType.includes("ADD")) return "default";
  if (actionType.includes("DELETE") || actionType.includes("REMOVE")) return "destructive";
  if (actionType.includes("UPDATE") || actionType.includes("ASSIGN")) return "secondary";
  return "outline";
};

type AuditLogWithActor = typeof auditLogs.$inferSelect & {
  actor: typeof user.$inferSelect | null;
};

const columns: ColumnDef<AuditLogWithActor>[] = [
  {
    header: "Date & Time",
    className: "w-[200px]",
    cell: (log) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(log.createdAt).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
    ),
  },
  {
    header: "Actor",
    className: "w-[200px] font-medium",
    cell: (log) => log.actor?.name || "System User",
  },
  {
    header: "Action",
    className: "w-[150px]",
    cell: (log) => (
      <Badge variant={getBadgeVariant(log.actionType)}>
        {log.actionType.replace("_", " ")}
      </Badge>
    ),
  },
  {
    header: "Description",
    className: "text-muted-foreground",
    accessorKey: "description",
  },
];

// FIXED: We now pass the promise down into the async component
async function AuditData({ searchParamsPromise }: { searchParamsPromise: Promise<{ page?: string }> }) {
  // Await the params INSIDE the Suspense boundary
  const searchParams = await searchParamsPromise;
  
  const rawPage = Number(searchParams.page);
  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (page - 1) * PAGE_SIZE;

  const [logs, totalCountResult] = await Promise.all([
    db.query.auditLogs.findMany({
      orderBy: [desc(auditLogs.createdAt)],
      limit: PAGE_SIZE,
      offset: offset,
      with: { actor: true },
    }),
    db.select({ count: count() }).from(auditLogs),
  ]);

  const totalRecords = totalCountResult[0].count;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;

  return (
    <DataTable
      data={logs}
      columns={columns}
      currentPage={page}
      totalPages={totalPages}
      basePath="/dashboard/audit"
    />
  );
}

// FIXED: This top-level page is now completely synchronous and non-blocking
export default function AuditLogsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<AuditSkeleton />}>
      <AuditData searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}