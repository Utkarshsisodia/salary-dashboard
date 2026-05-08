import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  currentPage?: number;
  totalPages?: number;
  basePath?: string;
}

export function DataTable<T>({
  data,
  columns,
  currentPage = 1,
  totalPages = 1,
  basePath,
}: DataTableProps<T>) {
  const hasPagination = basePath && totalPages > 1;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? String(item[col.accessorKey])
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasPagination && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              nativeButton={false}
              render={
                <Link
                  href={currentPage <= 1 ? "#" : `${basePath}?page=${currentPage - 1}`}
                  scroll={false}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Link>
              }
            />
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              nativeButton={false}
              render={
                <Link
                  href={
                    currentPage >= totalPages
                      ? "#"
                      : `${basePath}?page=${currentPage + 1}`
                  }
                  scroll={false}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}