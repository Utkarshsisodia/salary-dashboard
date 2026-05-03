"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function toggleAttendance() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const employeeId = session.user.id;

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const now = new Date();

  try {
    const existingRecord = await db.query.attendance.findFirst({
      where: and(
        eq(attendance.employeeId, employeeId),
        eq(attendance.date, today),
      ),
    });

    if (!existingRecord) {
      await db
        .insert(attendance)
        .values({
          employeeId,
          date: today,
          clockIn: now,
        })
        .onConflictDoNothing();
    } else if (!existingRecord.clockOut) {
      await db
        .update(attendance)
        .set({ clockOut: now })
        .where(eq(attendance.id, existingRecord.id));
    } else {
      return { error: "You have already completed your shift for today." };
    }

    revalidatePath("/dashboard/attendance");
    return { success: true };
  } catch (error) {
    console.error("Attendance Error:", error);
    return { error: "Failed to update attendance." };
  }
}
export async function toggleBreak() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const employeeId = session.user.id;
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const now = new Date();

  try {
    const existingRecord = await db.query.attendance.findFirst({
      where: and(
        eq(attendance.employeeId, employeeId),
        eq(attendance.date, today),
      ),
    });

    // 1. Prevent breaking if they haven't started working
    if (!existingRecord) {
      return { error: "You must clock in before taking a break." };
    }

    // 2. Prevent breaking if they already went home
    if (existingRecord.clockOut) {
      return { error: "Your shift is already complete for today." };
    }

    // 3. START BREAK: If breakStart is null, set it to now
    if (!existingRecord.breakStart) {
      await db
        .update(attendance)
        .set({ breakStart: now })
        .where(eq(attendance.id, existingRecord.id));
        
      revalidatePath("/dashboard/attendance");
      return { success: true, message: "Break started." };
    }

    // 4. END BREAK: If breakStart exists but breakEnd is null, set breakEnd to now
    if (existingRecord.breakStart && !existingRecord.breakEnd) {
      await db
        .update(attendance)
        .set({ breakEnd: now })
        .where(eq(attendance.id, existingRecord.id));
        
      revalidatePath("/dashboard/attendance");
      return { success: true, message: "Break ended." };
    }

    // 5. If both exist, they already took their break today
    return { error: "You have already taken your break for today." };
    
  } catch (error) {
    console.error("Break Action Error:", error);
    return { error: "Failed to update break status." };
  }
}