import { useEffect, useMemo, useState } from "react";
import { CalendarGrid } from "../components/CalendarGrid";
import { DayPanel } from "../components/DayPanel";
import { MonthSelector } from "../components/MonthSelector";
import { YearNavigator } from "../components/YearNavigator";
import { CURRENT_DATE, DEFAULT_SELECTED_DATE } from "../data/calendarConfig";
import { useCalendarContext } from "../hooks/useCalendarContext";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import type { EventInput, PrythianDate } from "../types/calendar";
import { getMonth } from "../utils/calendar";
import { isDateAvailable } from "../utils/dateComparison";
import { canEditCalendar } from "../utils/permissions";

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<PrythianDate>(DEFAULT_SELECTED_DATE);
  const { context, isLoading: isContextLoading } = useCalendarContext();
  const {
    events,
    getEventsForDate,
    addEvent,
    editEvent,
    removeEvent,
    isLoading: areEventsLoading,
    error: eventsError,
  } = useCalendarEvents(context?.owner.id, context?.viewerId);

  const selectedMonth = getMonth(selectedDate.month);
  const currentMonth = getMonth(CURRENT_DATE.month);
  const selectedEvents = useMemo(() => getEventsForDate(selectedDate), [getEventsForDate, selectedDate]);
  const isBusy = isContextLoading || areEventsLoading;
  const characterName = context?.owner.characterName ?? null;
  const seasonClass =
    selectedDate.month <= 3
      ? "season-spring"
      : selectedDate.month <= 6
        ? "season-summer"
        : selectedDate.month <= 9
          ? "season-autumn"
          : "season-winter";

  useEffect(() => {
    document.title = characterName ? `Calendário de ${characterName}` : "Calendário de Prythian";
  }, [characterName]);

  const guardedCreate = async (input: EventInput) => {
    if (!context || !canEditCalendar(context.permission) || !isDateAvailable(input)) {
      throw new Error("Criação não permitida para esta data ou usuário.");
    }

    await addEvent(input);
  };

  const guardedUpdate = async (eventId: string, input: EventInput) => {
    if (!context || !canEditCalendar(context.permission) || !isDateAvailable(input)) {
      throw new Error("Edição não permitida para esta data ou usuário.");
    }

    const updatedEvent = await editEvent(eventId, input);
    setSelectedDate({
      year: updatedEvent.year,
      month: updatedEvent.month,
      day: updatedEvent.day,
    });
  };

  const guardedDelete = async (eventId: string) => {
    if (!context || !canEditCalendar(context.permission)) {
      throw new Error("Exclusão não permitida para este usuário.");
    }

    await removeEvent(eventId);
  };

  if (isContextLoading) {
    return <main className="loading-screen">Abrindo o calendário...</main>;
  }

  if (!context) {
    return (
      <main className="invalid-context-screen">
        <section>
          <span className="eyebrow">Calendário</span>
          <h1>Este calendário deve ser acessado através do perfil do personagem no fórum.</h1>
          <p>Acesse o perfil do personagem e utilize o botão Calendário.</p>
        </section>
      </main>
    );
  }

  if (isBusy) {
    return <main className="loading-screen">Abrindo o calendário...</main>;
  }

  return (
    <main className={`calendar-page ${seasonClass}`}>
      <header className="calendar-hero">
        <div>
          <span className="eyebrow">Linha do tempo</span>
          <h1>{characterName}</h1>
          <p className="hero-calendar-label">Calendário</p>
          <p className="hero-period-line">
            {selectedMonth.name} - {selectedDate.year} d.T. - {selectedMonth.season}
          </p>
        </div>
        <div className="hero-meta">
          <span>Período Atual</span>
          <strong>
            {currentMonth.name} - {CURRENT_DATE.year} d.T.
          </strong>
          <span className="period-badge">Mês {CURRENT_DATE.month}</span>
        </div>
      </header>

      <section className="control-band">
        <YearNavigator
          year={selectedDate.year}
          onYearChange={(year) => setSelectedDate((current) => ({ ...current, year, day: 1 }))}
        />
        <MonthSelector selectedDate={selectedDate} events={events} onDateChange={setSelectedDate} />
      </section>

      <section className="month-title">
        <span>{selectedMonth.season}</span>
        <h2>{selectedMonth.name}</h2>
        <p>{selectedMonth.description}</p>
      </section>

      {eventsError && <p className="notice">{eventsError}</p>}

      <div className="calendar-workspace">
        <CalendarGrid
          year={selectedDate.year}
          month={selectedDate.month}
          selectedDate={selectedDate}
          events={events}
          onSelectDate={setSelectedDate}
        />
        <DayPanel
          date={selectedDate}
          events={selectedEvents}
          permission={context.permission}
          onCreateEvent={guardedCreate}
          onUpdateEvent={guardedUpdate}
          onDeleteEvent={guardedDelete}
        />
      </div>
    </main>
  );
}
