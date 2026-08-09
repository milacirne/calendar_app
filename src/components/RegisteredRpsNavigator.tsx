import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import type { CalendarEvent, EventStatus, PrythianDate } from "../types/calendar";
import { getMonth } from "../utils/calendar";
import { getMonthsWithEvents, getYearsWithEvents } from "../utils/eventIndex";

interface RegisteredRpsNavigatorProps {
  events: CalendarEvent[];
  onNavigate: (date: PrythianDate) => void;
}

const statusSections: Array<{ status: EventStatus; title: string }> = [
  { status: "ongoing", title: "RPs em andamento" },
  { status: "completed", title: "RPs concluídas" },
  { status: "paused", title: "RPs pausadas" },
];

function formatMonthShortcut(monthId: number, monthName: string) {
  const shortName = monthName.replace(/^Mês (da|do|das|dos|de) /, "");
  return `Mês ${String(monthId).padStart(2, "0")} - ${shortName}`;
}

export function RegisteredRpsNavigator({ events, onNavigate }: RegisteredRpsNavigatorProps) {
  const [selectedEventYear, setSelectedEventYear] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null);
  const hasEvents = events.length > 0;
  const eventsByStatus = useMemo(
    () =>
      statusSections.map((section) => ({
        ...section,
        events: events.filter((event) => event.status === section.status),
      })),
    [events],
  );
  const nonEmptySections = eventsByStatus.filter((section) => section.events.length > 0);
  const visibleSections =
    selectedEventYear && selectedStatus
      ? nonEmptySections.filter((section) => section.status === selectedStatus)
      : nonEmptySections;

  const resetSelection = () => {
    setSelectedEventYear(null);
    setSelectedStatus(null);
  };

  if (!hasEvents) {
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
          <button className="link-button" type="button" onClick={resetSelection}>
            <ArrowLeft size={15} />
            Ver anos com RPs
          </button>
        )}
      </div>

      <div className="rp-status-groups">
        {visibleSections.map((section) => {
          const chips = selectedEventYear
            ? getMonthsWithEvents(section.events, selectedEventYear).map((monthWithEvents) => {
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
            : getYearsWithEvents(section.events).map((yearWithEvents) => (
                <button
                  className="rp-chip"
                  type="button"
                  key={yearWithEvents.year}
                  onClick={() => {
                    setSelectedEventYear(yearWithEvents.year);
                    setSelectedStatus(section.status);
                  }}
                >
                  {yearWithEvents.year} d.T.
                  <span>{yearWithEvents.eventCount}</span>
                </button>
              ));

          return (
            <section className="rp-status-section" key={section.status}>
              <h4 className={`rp-status-title ${section.status}`}>{section.title}</h4>
              <div className="rp-chip-list">{chips}</div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
