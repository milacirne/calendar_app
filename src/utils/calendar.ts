import { DAYS_PER_MONTH, DAYS_PER_WEEK, MAX_YEAR, MIN_YEAR, MONTHS_PER_YEAR } from "../data/calendarConfig";
import { lunarWeeks } from "../data/lunarWeeks";
import { months } from "../data/months";
import { weekdays } from "../data/weekdays";
import type { LunarWeek, PrythianDate, PrythianMonth, Weekday } from "../types/calendar";

export function clampYear(year: number): number {
  return Math.min(Math.max(year, MIN_YEAR), MAX_YEAR);
}

export function getMonth(monthId: number): PrythianMonth {
  const month = months.find((item) => item.id === monthId);
  if (!month) {
    throw new Error(`Invalid Prythian month: ${monthId}`);
  }
  return month;
}

export function getSeason(monthId: number): string {
  return getMonth(monthId).season;
}

export function getWeekday(day: number): Weekday {
  const normalizedIndex = (day - 1) % DAYS_PER_WEEK;
  const weekday = weekdays[normalizedIndex];
  if (!weekday) {
    throw new Error(`Invalid Prythian day: ${day}`);
  }
  return weekday;
}

export function getLunarWeek(day: number): LunarWeek {
  const lunarWeek = lunarWeeks.find((week) => day >= week.startDay && day <= week.endDay);
  if (!lunarWeek) {
    throw new Error(`Invalid lunar day: ${day}`);
  }
  return lunarWeek;
}

export function getMonthDays(year: number, month: number): PrythianDate[] {
  return Array.from({ length: DAYS_PER_MONTH }, (_, index) => ({
    year,
    month,
    day: index + 1,
  }));
}

export function getPreviousMonth(date: Pick<PrythianDate, "year" | "month">): Pick<PrythianDate, "year" | "month"> {
  if (date.month === 1) {
    return { year: clampYear(date.year - 1), month: date.year === MIN_YEAR ? 1 : MONTHS_PER_YEAR };
  }

  return { year: date.year, month: date.month - 1 };
}

export function getNextMonth(date: Pick<PrythianDate, "year" | "month">): Pick<PrythianDate, "year" | "month"> {
  if (date.month === MONTHS_PER_YEAR) {
    return { year: clampYear(date.year + 1), month: date.year === MAX_YEAR ? MONTHS_PER_YEAR : 1 };
  }

  return { year: date.year, month: date.month + 1 };
}

export function getYearRanges(size = 50): Array<{ start: number; end: number; label: string }> {
  const ranges = [];

  for (let start = MIN_YEAR; start <= MAX_YEAR; start += size) {
    const end = Math.min(start + size - 1, MAX_YEAR);
    ranges.push({ start, end, label: `${start}-${end}` });
  }

  return ranges;
}

export function getYearsInRange(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function formatPrythianDate(date: PrythianDate): string {
  const month = getMonth(date.month);
  return `Dia ${date.day} - ${month.name} - ${date.year} d.T.`;
}
