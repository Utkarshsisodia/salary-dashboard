// app/dashboard/employees/EmployeeRowActions.tsx

import { MoreHorizontal, UserPen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogTrigger } from "@/components/ui/dialog";
import { AssignSalaryModal } from "../AssignSalaryModal";

export function EmployeeRowActions({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName: string;
}) {
  return (
    <AssignSalaryModal
      employeeId={employeeId}
      employeeName={employeeName}
      trigger={
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* FIX: Add nativeButton={false} to satisfy DialogTrigger's strictness */}
              <DropdownMenuItem 
                render={
                  <DialogTrigger 
                    nativeButton={false}
                    render={<div className="w-full cursor-pointer flex items-center" />} 
                  />
                }
              >
                <UserPen className="mr-2 h-4 w-4" />
                Update Salary
              </DropdownMenuItem>
              
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
}