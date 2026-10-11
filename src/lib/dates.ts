import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import { id } from "date-fns/locale";

export type PeriodFilter = "today" | "7d" | "this_month" | "last_month" | "this_year" | "custom";

export function getDateRangeFromPeriod(
  period: PeriodFilter,
  customStart?: Date,
  customEnd?: Date
): { start: Date; end: Date; label: string } {
  const now = new Date();

  switch (period) {
    case "today":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
        label: "Hari Ini",
      };
    case "7d":
      return {
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now),
        label: "7 Hari Terakhir",
      };
    case "this_month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: format(now, "MMMM yyyy", { locale: id }),
      };
    case "last_month": {
      const prevMonth = subMonths(now, 1);
      return {
        start: startOfMonth(prevMonth),
        end: endOfMonth(prevMonth),
        label: format(prevMonth, "MMMM yyyy", { locale: id }),
      };
    }
    case "this_year":
      return {
        start: startOfYear(now),
        end: endOfYear(now),
        label: `Tahun ${now.getFullYear()}`,
      };
    case "custom":
      return {
        start: customStart ? startOfDay(customStart) : startOfMonth(now),
        end: customEnd ? endOfDay(customEnd) : endOfMonth(now),
        label: "Kustom",
      };
    default:
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: format(now, "MMMM yyyy", { locale: id }),
      };
  }
}

export function formatDateIndo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMM yyyy", { locale: id });
}

export function formatDateTimeIndo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMM yyyy, HH:mm", { locale: id });
}
