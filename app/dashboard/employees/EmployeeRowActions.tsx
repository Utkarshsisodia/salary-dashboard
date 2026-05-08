"use client";

import Link from "next/link";
import { UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export function EmployeeRowActions({
  employeeId,
}: {
  employeeId: string;
}) {
  const searchParams = useSearchParams();
  const currentParams = new URLSearchParams(searchParams.toString());
  currentParams.set("assignId", employeeId);
  const queryString = currentParams.toString();

  return (
    <Button 
      variant="ghost" 
      size="icon-sm" 
      nativeButton={false}
      render={
        <Link href={`?${queryString}`} scroll={false}>
          <UserPen className="h-4 w-4" />
          <span className="sr-only">Update Salary</span>
        </Link>
      }
    />
  );
}