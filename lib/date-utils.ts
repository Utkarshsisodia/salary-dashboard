// lib/date-utils.ts
import { format, differenceInMinutes, isSameMonth, isSameYear } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

// You can eventually move this to an environment variable or user setting
const COMPANY_TIMEZONE = "Asia/Kolkata";

/**
 * Returns today's date string in YYYY-MM-DD format based on the company timezone.
 * Fixes the issue of servers in UTC rolling over to tomorrow too late/early.
 */
export function getTodayDateString(): string {
  return formatInTimeZone(new Date(), COMPANY_TIMEZONE, "yyyy-MM-dd");
}

/**
 * Formats a database timestamp into a readable time (e.g., "09:00 AM")
 */
export function formatTime(date: Date | string): string {
  return formatInTimeZone(new Date(date), COMPANY_TIMEZONE, "hh:mm a");
}

/**
 * Formats a database timestamp into a readable date (e.g., "Oct 24, 2026")
 */
export function formatDate(date: Date | string): string {
  return formatInTimeZone(new Date(date), COMPANY_TIMEZONE, "MMM d, yyyy");
}

/**
 * Replaces your custom math (diffMs / 1000 * 60 * 60).
 * Accurately calculates hours worked, subtracting break times.
 */
export function calculateHoursWorked(
  clockIn: Date,
  clockOut: Date,
  breakStart: Date | null,
  breakEnd: Date | null
): number {
  let totalMinutes = differenceInMinutes(clockOut, clockIn);

  if (breakStart && breakEnd) {
    const breakMinutes = differenceInMinutes(breakEnd, breakStart);
    totalMinutes -= breakMinutes;
  }

  return totalMinutes / 60;
}

/**
 * Checks if a specific date record belongs to the current month/year
 */
export function isCurrentMonth(dateStr: string | Date): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const zonedDate = toZonedTime(date, COMPANY_TIMEZONE);
  const zonedNow = toZonedTime(now, COMPANY_TIMEZONE);

  return isSameMonth(zonedDate, zonedNow) && isSameYear(zonedDate, zonedNow);
}