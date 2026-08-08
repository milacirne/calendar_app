import { initialOfficialEvents } from "../data/officialEvents";
import type { CalendarEvent } from "../types/calendar";

export async function getOfficialEvents(): Promise<CalendarEvent[]> {
  return initialOfficialEvents;
}
