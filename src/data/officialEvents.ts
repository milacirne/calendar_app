import type { CalendarEvent } from "../types/calendar";

export const initialOfficialEvents: CalendarEvent[] = [
  {
    id: "official-1",
    ownerId: "official",
    year: 447,
    month: 1,
    day: 15,
    title: "Calanmai",
    rpUrl: "https://forum.example.com/topic/calanmai",
    participants: [{ id: "p-forum", name: "Evento oficial" }],
    status: "ongoing",
    type: "official",
    notes: "Evento oficial do fórum durante o Mês da Regeneração.",
  },
  {
    id: "official-2",
    ownerId: "official",
    year: 447,
    month: 1,
    day: 1,
    title: "Abertura do ciclo da Regeneração",
    rpUrl: "https://forum.example.com/topic/regeneracao-oficial",
    participants: [{ id: "p-forum", name: "Evento oficial" }],
    status: "completed",
    type: "official",
    notes: "Marco oficial do início do ano feérico.",
  },
];
