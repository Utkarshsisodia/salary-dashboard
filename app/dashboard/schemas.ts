// app/dashboard/schemas.ts
import { z } from "zod";

export const addEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["admin", "employee"]),
});
export const assignSalarySchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  baseAmount: z.number().min(0, "Base amount must be positive"),
  bonus: z.number().min(0).default(0),
  effectiveDate: z.string().min(1, "Effective date is required"),
});