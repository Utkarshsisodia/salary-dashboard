import { Suspense } from "react";
import { db } from "@/db";
import { auditLogs, user } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/DataTable";
import Loading from './loading'
import { requireAdmin } from "@/lib/session";

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

async function AuditData({ searchParams }: { searchParams: { page?: string } }) {
  await requireAdmin();
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

async function AuditDataLoader({ searchParamsPromise }: { searchParamsPromise: Promise<{ page?: string }> }) {
  const searchParams = await searchParamsPromise;
  const currentPage = searchParams.page || "1";

  return (
    <Suspense key={currentPage} fallback={<Loading />}>
      <AuditData searchParams={searchParams} />
    </Suspense>
  );
}

export default function AuditLogsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <AuditDataLoader searchParamsPromise={props.searchParams} />
    </Suspense>
  );
}