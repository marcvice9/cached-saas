import type { DayOfWeek, WeekStartDay } from "../types/database";

const DAY_INDEX: Record<DayOfWeek, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
};

// Normalize dates to UTC to avoid off-by-one issues from local timezones.
const toUtcDate = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const parseUtcDate = (dateStr: string) => new Date(`${dateStr}T00:00:00Z`);
const formatDateUTC = (d: Date) => d.toISOString().split("T")[0];

/**
 * Get the start date (as YYYY-MM-DD) of the week containing `date`,
 * based on the user's weekStartDay preference.
 */
export function getWeekStartDate(
  date: Date,
  weekStartDay: WeekStartDay = "SUNDAY"
): string {
  const d = toUtcDate(date);
  const currentDay = d.getUTCDay(); // 0=Sun
  const startDay = weekStartDay === "MONDAY" ? 1 : 0;
  const diff = (currentDay - startDay + 7) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return formatDateUTC(d);
}

/**
 * Get dates for a specific day_of_week within a week that starts on weekStartDate.
 */
export function getDateForDayInWeek(
  weekStartDate: string,
  dayOfWeek: DayOfWeek
): string {
  const start = parseUtcDate(weekStartDate);
  const startDayIndex = start.getUTCDay();
  const targetDayIndex = DAY_INDEX[dayOfWeek];
  const diff = (targetDayIndex - startDayIndex + 7) % 7;
  const result = new Date(start);
  result.setUTCDate(result.getUTCDate() + diff);
  return formatDateUTC(result);
}

/**
 * Calculate slot duration in minutes from start/end time strings (HH:MM).
 */
export function slotDurationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/**
 * Get the next week's start date from a given week start.
 */
export function getNextWeekStart(weekStartDate: string): string {
  const d = new Date(weekStartDate + "T00:00:00");
  d.setDate(d.getDate() + 7);
  return formatDate(d);
}

export function formatDate(d: Date): string {
  return formatDateUTC(toUtcDate(d));
}

export function getAllDatesInWeek(weekStartDate: string): string[] {
  const dates: string[] = [];
  const start = parseUtcDate(weekStartDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(formatDateUTC(d));
  }
  return dates;
}
