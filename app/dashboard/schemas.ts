// app/dashboard/schemas.ts
import { z } from "zod";

export const addEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["admin", "employee"]),
});