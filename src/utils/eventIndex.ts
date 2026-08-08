import type { CalendarEvent } from "../types/calendar";

export interface YearWithEvents {
  year: number;
  eventCount: number;
}

export interface MonthWithEvents {
  month: number;
  eventCount: number;
}

export function getYearsWithEvents(events: CalendarEvent[]): YearWithEvents[] {
  const counts = events.reduce<Map<number, number>>((accumulator, event) => {
    accumulator.set(event.year, (accumulator.get(event.year) ?? 0) + 1);
    return accumulator;
  }, new Map());

  return Array.from(counts.entries())
    .map(([year, eventCount]) => ({ year, eventCount }))
    .sort((yearA, yearB) => yearB.year - yearA.year);
}

export function getMonthsWithEvents(events: CalendarEvent[], year: number): MonthWithEvents[] {
  const counts = events
    .filter((event) => event.year === year)
    .reduce<Map<number, number>>((accumulator, event) => {
      accumulator.set(event.month, (accumulator.get(event.month) ?? 0) + 1);
      return accumulator;
    }, new Map());

  return Array.from(counts.entries())
    .map(([month, eventCount]) => ({ month, eventCount }))
    .sort((monthA, monthB) => monthA.month - monthB.month);
}
