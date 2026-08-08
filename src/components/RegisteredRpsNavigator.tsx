import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import type { CalendarEvent, PrythianDate } from "../types/calendar";
import { getMonth } from "../utils/calendar";
import { getMonthsWithEvents, getYearsWithEvents } from "../utils/eventIndex";

interface RegisteredRpsNavigatorProps {
  events: CalendarEvent[];
  onNavigate: (date: PrythianDate) => void;
}

function formatMonthShortcut(monthId: number, monthName: string) {
  const shortName = monthName.replace(/^Mês (da|do|das|dos|de) /, "");
  return `Mês ${String(monthId).padStart(2, "0")} - ${shortName}`;
}

export function RegisteredRpsNavigator({ events, onNavigate }: RegisteredRpsNavigatorProps) {
  const [selectedEventYear, setSelectedEventYear] = useState<number | null>(null);
  const personalEvents = useMemo(() => events.filter((event) => event.type === "personal"), [events]);
  const yearsWithEvents = useMemo(() => getYearsWithEvents(personalEvents), [personalEvents]);
  const monthsWithEvents = useMemo(
    () => (selectedEventYear ? getMonthsWithEvents(personalEvents, selectedEventYear) : []),
    [personalEvents, selectedEventYear],
  );

  if (yearsWithEvents.length === 0) {
    return (
      <section className="registered-rps" aria-label="RPs registradas">
        <h3>RPs registradas</h3>
        <p>Nenhuma RP registrada ainda.</p>
      </section>
    );
  }

  return (
    <section className="registered-rps" aria-label="RPs registradas">
      <div className="registered-rps-heading">
        <h3>{selectedEventYear ? `RPs registradas em ${selectedEventYear} d.T.` : "RPs registradas"}</h3>
        {selectedEventYear && (
          <button className="link-button" type="button" onClick={() => setSelectedEventYear(null)}>
            <ArrowLeft size={15} />
            Ver anos com RPs
          </button>
        )}
      </div>

      <div className="rp-chip-list">
        {selectedEventYear
          ? monthsWithEvents.map((monthWithEvents) => {
              const month = getMonth(monthWithEvents.month);

              return (
                <button
                  className="rp-chip"
                  type="button"
                  key={month.id}
                  onClick={() => onNavigate({ year: selectedEventYear, month: month.id, day: 1 })}
                >
                  {formatMonthShortcut(month.id, month.name)}
                  <span>{monthWithEvents.eventCount}</span>
                </button>
              );
            })
          : yearsWithEvents.map((yearWithEvents) => (
              <button
                className="rp-chip"
                type="button"
                key={yearWithEvents.year}
                onClick={() => setSelectedEventYear(yearWithEvents.year)}
              >
                {yearWithEvents.year} d.T.
                <span>{yearWithEvents.eventCount}</span>
              </button>
            ))}
      </div>
    </section>
  );
}
