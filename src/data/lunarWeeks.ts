import type { LunarWeek } from "../types/calendar";

export const lunarWeeks: LunarWeek[] = [
  { id: 1, name: "Semana da Gênese", moonPhase: "Lua Nova", startDay: 1, endDay: 7 },
  { id: 2, name: "Semana da Ascensão", moonPhase: "Lua Crescente", startDay: 8, endDay: 14 },
  { id: 3, name: "Semana do Ápice", moonPhase: "Lua Cheia", startDay: 15, endDay: 21 },
  { id: 4, name: "Semana do Declínio", moonPhase: "Lua Minguante", startDay: 22, endDay: 28 },
];
