import { get, put } from "@vercel/blob";
import type { CalendarEvent, EventInput, EventStatus } from "../../src/types/calendar.js";
import { CURRENT_DATE, DAYS_PER_MONTH, getCreationLimitDate, MIN_YEAR, MONTHS_PER_YEAR } from "../../src/data/calendarConfig.js";

export interface StoredCalendar {
  ownerId: string;
  events: CalendarEvent[];
}

const VALID_STATUSES: EventStatus[] = ["ongoing", "completed", "paused"];

function toAbsoluteDay(year: number, month: number, day: number) {
  return (year - 1) * MONTHS_PER_YEAR * DAYS_PER_MONTH + (month - 1) * DAYS_PER_MONTH + day;
}

function isAvailableForRegistration(year: number, month: number, day: number) {
  const limit = getCreationLimitDate();
  return toAbsoluteDay(year, month, day) <= toAbsoluteDay(limit.year, limit.month, limit.day);
}

function getCalendarPath(ownerId: string) {
  return `calendars/${ownerId}.json`;
}

function assertOwnerId(ownerId: string) {
  if (!ownerId || !/^[a-zA-Z0-9_-]+$/.test(ownerId)) {
    throw new ValidationError("ownerId inválido.");
  }
}

function validateEventInput(input: Partial<EventInput>): EventInput {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const rpUrl = typeof input.rpUrl === "string" ? input.rpUrl.trim() : "";
  const notes = typeof input.notes === "string" && input.notes.trim() ? input.notes.trim() : undefined;
  const year = input.year;
  const month = input.month;
  const day = input.day;

  if (typeof year !== "number" || !Number.isInteger(year) || year < MIN_YEAR || year > CURRENT_DATE.year) {
    throw new ValidationError(`Ano deve estar entre ${MIN_YEAR} e ${CURRENT_DATE.year}.`);
  }

  if (typeof month !== "number" || !Number.isInteger(month) || month < 1 || month > MONTHS_PER_YEAR) {
    throw new ValidationError("Mês deve estar entre 1 e 12.");
  }

  if (typeof day !== "number" || !Number.isInteger(day) || day < 1 || day > DAYS_PER_MONTH) {
    throw new ValidationError("Dia deve estar entre 1 e 28.");
  }

  if (!isAvailableForRegistration(year, month, day)) {
    throw new ValidationError("Esta data ainda não está disponível para registros.");
  }

  if (!title) {
    throw new ValidationError("Título é obrigatório.");
  }

  if (!rpUrl) {
    throw new ValidationError("Link da RP é obrigatório.");
  }

  try {
    new URL(rpUrl);
  } catch {
    throw new ValidationError("Link da RP deve ser uma URL válida.");
  }

  if (!VALID_STATUSES.includes(input.status as EventStatus)) {
    throw new ValidationError("Status inválido.");
  }

  if (!Array.isArray(input.participants) || input.participants.length === 0) {
    throw new ValidationError("Informe pelo menos um participante.");
  }

  const participants = input.participants.map((participant) => {
    const name = typeof participant?.name === "string" ? participant.name.trim() : "";
    if (!name) {
      throw new ValidationError("Participantes precisam ter nome.");
    }

    return {
      id: typeof participant.id === "string" && participant.id.trim()
        ? participant.id.trim()
        : name.toLowerCase().replace(/\s+/g, "-"),
      name,
    };
  });

  return {
    year,
    month,
    day,
    title,
    rpUrl,
    participants,
    status: input.status as EventStatus,
    notes,
  };
}

export class ValidationError extends Error {
  status = 400;
}

export class NotFoundError extends Error {
  status = 404;
}

export async function getCalendar(ownerId: string): Promise<StoredCalendar> {
  assertOwnerId(ownerId);

  const pathname = getCalendarPath(ownerId);
  const result = await get(pathname, { access: "private", useCache: false });

  if (!result?.stream) {
    return { ownerId, events: [] };
  }

  const text = await new Response(result.stream).text();
  return JSON.parse(text) as StoredCalendar;
}

export async function saveCalendar(ownerId: string, calendar: StoredCalendar): Promise<StoredCalendar> {
  assertOwnerId(ownerId);

  const normalizedCalendar: StoredCalendar = {
    ownerId,
    events: calendar.events.filter((event) => event.type === "personal" && event.ownerId === ownerId),
  };

  await put(getCalendarPath(ownerId), JSON.stringify(normalizedCalendar, null, 2), {
    access: "private",
    allowOverwrite: true,
    contentType: "application/json",
  });

  return normalizedCalendar;
}

export async function createEvent(ownerId: string, input: Partial<EventInput>): Promise<CalendarEvent> {
  const calendar = await getCalendar(ownerId);
  const validatedInput = validateEventInput(input);
  const event: CalendarEvent = {
    ...validatedInput,
    id: crypto.randomUUID(),
    ownerId,
    type: "personal",
  };

  await saveCalendar(ownerId, {
    ownerId,
    events: [...calendar.events, event],
  });

  return event;
}

export async function updateEvent(
  ownerId: string,
  eventId: string,
  input: Partial<EventInput>,
): Promise<CalendarEvent> {
  const calendar = await getCalendar(ownerId);
  const existing = calendar.events.find((event) => event.id === eventId);
  if (!existing) {
    throw new NotFoundError("Evento não encontrado.");
  }

  const validatedInput = validateEventInput(input);
  const updatedEvent: CalendarEvent = {
    ...existing,
    ...validatedInput,
    id: existing.id,
    ownerId,
    type: "personal",
  };

  await saveCalendar(ownerId, {
    ownerId,
    events: calendar.events.map((event) => (event.id === eventId ? updatedEvent : event)),
  });

  return updatedEvent;
}

export async function deleteEvent(ownerId: string, eventId: string): Promise<void> {
  const calendar = await getCalendar(ownerId);
  const exists = calendar.events.some((event) => event.id === eventId);
  if (!exists) {
    throw new NotFoundError("Evento não encontrado.");
  }

  await saveCalendar(ownerId, {
    ownerId,
    events: calendar.events.filter((event) => event.id !== eventId),
  });
}
