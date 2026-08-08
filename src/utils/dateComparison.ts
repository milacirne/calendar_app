import { getCreationLimitDate, CURRENT_DATE } from "../data/calendarConfig";
import type { PrythianDate } from "../types/calendar";

export function toAbsoluteDay(date: PrythianDate): number {
  return (date.year - 1) * 336 + (date.month - 1) * 28 + date.day;
}

export function compareDates(dateA: PrythianDate, dateB: PrythianDate): number {
  return toAbsoluteDay(dateA) - toAbsoluteDay(dateB);
}

export function isDateAvailable(date: PrythianDate): boolean {
  return compareDates(date, getCreationLimitDate()) <= 0;
}

export function isCurrentDate(date: PrythianDate): boolean {
  return compareDates(date, CURRENT_DATE) === 0;
}

export function isSameDate(dateA: PrythianDate, dateB: PrythianDate): boolean {
  return compareDates(dateA, dateB) === 0;
}
