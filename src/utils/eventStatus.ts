import type { EventStatus } from "../types/calendar";

export const eventStatusLabels: Record<EventStatus, string> = {
  ongoing: "Em andamento",
  completed: "Concluída",
  paused: "Pausada",
};

export const eventStatusOptions: Array<{ value: EventStatus; label: string }> = [
  { value: "ongoing", label: eventStatusLabels.ongoing },
  { value: "completed", label: eventStatusLabels.completed },
  { value: "paused", label: eventStatusLabels.paused },
];
