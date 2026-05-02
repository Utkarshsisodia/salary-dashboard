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
