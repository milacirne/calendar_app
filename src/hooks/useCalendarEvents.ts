import { useCallback, useEffect, useMemo, useState } from "react";
import { createEvent, deleteEvent, getEventsForOwner, updateEvent } from "../services/eventService";
import { getOfficialEvents } from "../services/officialEventService";
import type { CalendarEvent, EventInput, PrythianDate } from "../types/calendar";

export function useCalendarEvents(ownerId?: string, viewerId?: string | null) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(ownerId));
  const [error, setError] = useState<string | null>(null);

  const refreshEvents = useCallback(async () => {
    if (!ownerId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [personalEvents, officialEvents] = await Promise.all([getEventsForOwner(ownerId), getOfficialEvents()]);
      setEvents([...personalEvents, ...officialEvents]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Falha ao carregar eventos.");
    } finally {
      setIsLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    void refreshEvents();
  }, [refreshEvents]);

  const getEventsForDate = useCallback(
    (date: PrythianDate) =>
      events.filter((event) => event.year === date.year && event.month === date.month && event.day === date.day),
    [events],
  );

  const eventCountByDate = useMemo(() => {
    return events.reduce<Record<string, number>>((accumulator, event) => {
      const key = `${event.year}-${event.month}-${event.day}`;
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [events]);

  const addEvent = useCallback(
    async (input: EventInput) => {
      if (!ownerId) {
        throw new Error("Calendário sem proprietário definido.");
      }

      if (!viewerId) {
        throw new Error("Visualizador não identificado.");
      }

      const created = await createEvent(ownerId, viewerId, input);
      setEvents((current) => [...current, created]);
      return created;
    },
    [ownerId, viewerId],
  );

  const editEvent = useCallback(
    async (eventId: string, input: EventInput) => {
      if (!ownerId) {
        throw new Error("Calendário sem proprietário definido.");
      }

      if (!viewerId) {
        throw new Error("Visualizador não identificado.");
      }

      const updated = await updateEvent(ownerId, viewerId, eventId, input);
      setEvents((current) => current.map((event) => (event.id === eventId ? updated : event)));
      return updated;
    },
    [ownerId, viewerId],
  );

  const removeEvent = useCallback(
    async (eventId: string) => {
      if (!ownerId) {
        throw new Error("Calendário sem proprietário definido.");
      }

      if (!viewerId) {
        throw new Error("Visualizador não identificado.");
      }

      await deleteEvent(ownerId, viewerId, eventId);
      setEvents((current) => current.filter((event) => event.id !== eventId));
    },
    [ownerId, viewerId],
  );

  return {
    events,
    eventCountByDate,
    isLoading,
    error,
    getEventsForDate,
    addEvent,
    editEvent,
    removeEvent,
    refreshEvents,
  };
}
