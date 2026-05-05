"use server";

import { db } from "@/db";
import { attendance } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { protectedActionClient } from "@/lib/safe-action";

export const toggleAttendance = protectedActionClient
  .action(async ({ ctx }) => {
    // Look how clean this is. No manual session checking!
    const employeeId = ctx.user.id;
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const now = new Date();

    try {
      const existingRecord = await db.query.attendance.findFirst({
        where: and(
          eq(attendance.employeeId, employeeId),
          eq(attendance.date, today),
        ),
      });

      if (!existingRecord) {
        await db.insert(attendance)
          .values({ employeeId, date: today, clockIn: now })
          .onConflictDoNothing();
      } else if (!existingRecord.clockOut) {
        await db.update(attendance)
          .set({ clockOut: now })
          .where(eq(attendance.id, existingRecord.id));
      } else {
        throw new Error("You have already completed your shift for today.");
      }

      revalidatePath("/dashboard/attendance");
      return { successMessage: "Attendance recorded successfully." };
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      throw new Error(message);
    }
  });

export const toggleBreak = protectedActionClient
  .action(async ({ ctx }) => {
    const employeeId = ctx.user.id;
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const now = new Date();

    try {
      const existingRecord = await db.query.attendance.findFirst({
        where: and(
          eq(attendance.employeeId, employeeId),
          eq(attendance.date, today),
        ),
      });

      if (!existingRecord) throw new Error("You must clock in before taking a break.");
      if (existingRecord.clockOut) throw new Error("Your shift is already complete for today.");

      if (!existingRecord.breakStart) {
        await db.update(attendance)
          .set({ breakStart: now })
          .where(eq(attendance.id, existingRecord.id));
          
        revalidatePath("/dashboard/attendance");
        return { successMessage: "Break started." };
      }

      if (existingRecord.breakStart && !existingRecord.breakEnd) {
        await db.update(attendance)
          .set({ breakEnd: now })
          .where(eq(attendance.id, existingRecord.id));
          
        revalidatePath("/dashboard/attendance");
        return { successMessage: "Break ended." };
      }

      throw new Error("You have already taken your break for today.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      throw new Error(message);
    }
  });