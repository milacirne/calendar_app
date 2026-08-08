import { weekdays } from "../data/weekdays";
import type { CalendarEvent, PrythianDate } from "../types/calendar";
import { getLunarWeek, getMonthDays, getWeekday } from "../utils/calendar";
import { isDateAvailable, isSameDate } from "../utils/dateComparison";

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: PrythianDate;
  events: CalendarEvent[];
  onSelectDate: (date: PrythianDate) => void;
}

export function CalendarGrid({ year, month, selectedDate, events, onSelectDate }: CalendarGridProps) {
  const days = getMonthDays(year, month);

  return (
    <section className="calendar-grid-panel" aria-label="Calendário mensal">
      <div className="calendar-legend" aria-label="Legenda do calendário">
        <span className="legend-item personal"><i /> RPs registradas</span>
        <span className="legend-item official"><i /> RPs oficiais</span>
      </div>

      <div className="weekday-row">
        {weekdays.map((weekday) => (
          <div className="weekday-heading" key={weekday.id} title={weekday.title}>
            <strong>{weekday.name}</strong>
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date) => {
          const lunarWeek = getLunarWeek(date.day);
          const weekday = getWeekday(date.day);
          const dayEvents = events.filter((event) => isSameDate(event, date));
          const personalCount = dayEvents.filter((event) => event.type === "personal").length;
          const officialCount = dayEvents.filter((event) => event.type === "official").length;
          const unavailable = !isDateAvailable(date);
          const className = [
            "day-cell",
            personalCount > 0 ? "has-personal-rp" : "",
            officialCount > 0 ? "has-official-rp" : "",
            isSameDate(date, selectedDate) ? "selected" : "",
            unavailable ? "unavailable" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              className={className}
              key={date.day}
              type="button"
              title={`Dia ${date.day} - ${lunarWeek.name} - ${lunarWeek.moonPhase}`}
              onClick={() => onSelectDate(date)}
            >
              <span className="day-cell-topline">
                <span className="day-cell-date-mark">
                  <strong>{date.day}</strong>
                  <span className={`moon-icon moon-phase-${lunarWeek.id}`} aria-hidden="true" />
                </span>
                <span className="day-cell-mobile-weekday">{weekday.name}</span>
              </span>
              {(personalCount > 0 || officialCount > 0) && (
                <span className="event-markers">
                  {personalCount > 0 && (
                    <span className="event-marker personal">
                      <i /> {personalCount} RP{personalCount === 1 ? "" : "s"}
                    </span>
                  )}
                  {officialCount > 0 && (
                    <span className="event-marker official">
                      <i /> {officialCount} {officialCount === 1 ? "Oficial" : "Oficiais"}
                    </span>
                  )}
                </span>
              )}
              {unavailable && <span className="locked-marker">Indisponível</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
