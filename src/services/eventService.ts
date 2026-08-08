import type { CalendarEvent, EventInput, PrythianDate } from "../types/calendar";
import { compareDates } from "../utils/dateComparison";

interface CalendarEventsResponse {
  ownerId: string;
  events: CalendarEvent[];
}

// Mock storage for local development
const mockEventStore = new Map<string, CalendarEvent[]>();

function isLocalMode(): boolean {
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function initializeMockData(ownerId: string): void {
  if (!mockEventStore.has(ownerId)) {
    mockEventStore.set(ownerId, []);
  }
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : null;
    const message = payload?.error ?? `Erro na API (${response.status}).`;
    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    throw new Error("A API não respondeu JSON. Rode o projeto com `npx vercel dev` para servir as Vercel Functions.");
  }

  return response.json() as Promise<T>;
}

function viewerHeaders(viewerId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Viewer-Id": viewerId,
  };
}

export async function getEventsForOwner(ownerId: string): Promise<CalendarEvent[]> {
  if (isLocalMode()) {
    initializeMockData(ownerId);
    const events = mockEventStore.get(ownerId) ?? [];
    return events.sort((eventA, eventB) => compareDates(eventA, eventB));
  }

  const calendar = await requestJson<CalendarEventsResponse>(`/api/calendars/${ownerId}/events`);
  return calendar.events.sort((eventA, eventB) => compareDates(eventA, eventB));
}

export async function getEventsForDate(ownerId: string, date: PrythianDate): Promise<CalendarEvent[]> {
  const events = await getEventsForOwner(ownerId);
  return events.filter((event) => event.year === date.year && event.month === date.month && event.day === date.day);
}

export async function createEvent(ownerId: string, viewerId: string, input: EventInput): Promise<CalendarEvent> {
  if (isLocalMode()) {
    initializeMockData(ownerId);
    const event: CalendarEvent = {
      ...input,
      id: crypto.randomUUID(),
      ownerId,
      type: "personal",
    };
    const events = mockEventStore.get(ownerId) ?? [];
    events.push(event);
    mockEventStore.set(ownerId, events);
    return event;
  }

  return requestJson<CalendarEvent>(`/api/calendars/${ownerId}/events`, {
    method: "POST",
    headers: viewerHeaders(viewerId),
    body: JSON.stringify(input),
  });
}

export async function updateEvent(
  ownerId: string,
  viewerId: string,
  eventId: string,
  input: EventInput,
): Promise<CalendarEvent> {
  if (isLocalMode()) {
    initializeMockData(ownerId);
    const events = mockEventStore.get(ownerId) ?? [];
    const existingEvent = events.find((e) => e.id === eventId);
    if (!existingEvent) {
      throw new Error("Evento não encontrado.");
    }
    const updatedEvent: CalendarEvent = {
      ...existingEvent,
      ...input,
      id: eventId,
      ownerId,
    };
    const updatedEvents = events.map((e) => (e.id === eventId ? updatedEvent : e));
    mockEventStore.set(ownerId, updatedEvents);
    return updatedEvent;
  }

  return requestJson<CalendarEvent>(`/api/calendars/${ownerId}/events/${eventId}`, {
    method: "PUT",
    headers: viewerHeaders(viewerId),
    body: JSON.stringify(input),
  });
}

export async function deleteEvent(ownerId: string, viewerId: string, eventId: string): Promise<void> {
  if (isLocalMode()) {
    initializeMockData(ownerId);
    const events = mockEventStore.get(ownerId) ?? [];
    const filteredEvents = events.filter((e) => e.id !== eventId);
    mockEventStore.set(ownerId, filteredEvents);
    return;
  }

  await requestJson<{ ok: true }>(`/api/calendars/${ownerId}/events/${eventId}`, {
    method: "DELETE",
    headers: viewerHeaders(viewerId),
  });
}
