export interface PrythianDate {
  year: number;
  month: number;
  day: number;
}

export interface PrythianMonth {
  id: number;
  name: string;
  season: string;
  court: string;
  description?: string;
}

export interface Weekday {
  id: number;
  name: string;
  title: string;
}

export interface LunarWeek {
  id: number;
  name: string;
  moonPhase: string;
  startDay: number;
  endDay: number;
}

export type Permission = "owner" | "viewer" | "unauthenticated";

export type EventStatus = "ongoing" | "completed" | "paused";

export type EventType = "personal" | "official";

export interface Participant {
  id: string;
  name: string;
}

export interface CalendarEvent {
  id: string;
  ownerId: string;
  year: number;
  month: number;
  day: number;
  title: string;
  rpUrl: string;
  participants: Participant[];
  status: EventStatus;
  type: EventType;
  notes?: string;
}

export interface CalendarOwner {
  id: string;
  displayName: string;
  characterName: string;
}

export interface AuthUser {
  id: string;
  displayName: string;
}

export interface CalendarContextState {
  authenticatedUser: AuthUser | null;
  owner: CalendarOwner;
  viewerId: string | null;
  permission: Permission;
}

export type EventInput = Omit<CalendarEvent, "id" | "ownerId" | "type">;
