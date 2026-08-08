import type { Permission } from "../types/calendar";

export function canEditCalendar(permission: Permission): boolean {
  return permission === "owner";
}
