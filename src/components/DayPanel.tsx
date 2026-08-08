import { Edit3, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { CalendarEvent, EventInput, Permission, PrythianDate } from "../types/calendar";
import { formatPrythianDate, getLunarWeek, getWeekday } from "../utils/calendar";
import { isDateAvailable } from "../utils/dateComparison";
import { eventStatusLabels } from "../utils/eventStatus";
import { canEditCalendar } from "../utils/permissions";
import { EventForm } from "./EventForm";

interface DayPanelProps {
  date: PrythianDate;
  events: CalendarEvent[];
  permission: Permission;
  onCreateEvent: (input: EventInput) => Promise<void>;
  onUpdateEvent: (eventId: string, input: EventInput) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export function DayPanel({
  date,
  events,
  permission,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
}: DayPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const weekday = getWeekday(date.day);
  const lunarWeek = getLunarWeek(date.day);
  const available = isDateAvailable(date);
  const canEdit = canEditCalendar(permission);
  const canCreate = available && canEdit;

  const closeForm = () => {
    setIsCreating(false);
    setEditingEvent(null);
  };

  useEffect(() => {
    closeForm();
  }, [date.year, date.month, date.day]);

  return (
    <aside className="day-panel">
      <div className="panel-heading">
        <p>{weekday.name} - {weekday.title}</p>
        <h2>{formatPrythianDate(date)}</h2>
        <span>{lunarWeek.name} - {lunarWeek.moonPhase}</span>
      </div>

      {!available && <p className="notice">Esta data ainda não está disponível para registros.</p>}
      {permission === "viewer" && <p className="notice">Visitantes podem visualizar, mas não editar este calendário.</p>}
      {permission === "unauthenticated" && <p className="notice">A autenticação será definida na integração futura.</p>}

      <div className="events-list">
        <div className="events-list-title">
          <h3>Eventos</h3>
          <span>{events.length}</span>
        </div>

        {events.length === 0 && <p className="empty-state">Nenhuma RP registrada neste dia.</p>}

        {events.map((event) => (
          <article className="event-item" key={event.id}>
            <div>
              <span className={`event-type-badge ${event.type}`}>
                {event.type === "official" ? "RP oficial" : "RP registrada"}
              </span>
              <h4>{event.title}</h4>
              <p>{event.participants.map((participant) => participant.name).join(" x ")}</p>
              <span className="event-status">{eventStatusLabels[event.status]}</span>
              {event.notes && (
                <div className="event-notes">
                  <small>{event.notes}</small>
                </div>
              )}
            </div>
            <div className="event-actions">
              <a className="icon-button" href={event.rpUrl} target="_blank" rel="noreferrer" title="Abrir RP">
                <ExternalLink size={17} />
              </a>
              {canEdit && event.type === "personal" && (
                <>
                  <button className="icon-button" type="button" onClick={() => setEditingEvent(event)} title="Editar RP">
                    <Edit3 size={17} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDeleteEvent(event.id)} title="Excluir RP">
                    <Trash2 size={17} />
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      {!isCreating && !editingEvent && (
        <div className="day-panel-actions">
          {canCreate && (
            <button className="primary-button wide" type="button" onClick={() => setIsCreating(true)}>
              <Plus size={18} />
              Adicionar RP
            </button>
          )}
        </div>
      )}

      {(isCreating || editingEvent) && (
        <EventForm
          date={date}
          event={editingEvent}
          onCancel={closeForm}
          onSubmit={async (input) => {
            if (editingEvent) {
              await onUpdateEvent(editingEvent.id, input);
            } else {
              await onCreateEvent(input);
            }
            closeForm();
          }}
        />
      )}
    </aside>
  );
}
