import Link from "next/link";
import { UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmployeeRowActions({
  employeeId,
}: {
  employeeId: string;
}) {
  return (
    <Button 
      variant="ghost" 
      size="icon-sm" // Note: icon-sm matches your button.tsx variants
      nativeButton={false}
      render={
        <Link href={`?assignId=${employeeId}`} scroll={false}>
          <UserPen className="h-4 w-4" />
          <span className="sr-only">Update Salary</span>
        </Link>
      }
    />
  );
}