import { useEffect, useMemo, useState } from "react";
import { DAYS_PER_MONTH, MAX_YEAR, MIN_YEAR } from "../data/calendarConfig";
import { months } from "../data/months";
import type { CalendarEvent, EventInput, EventStatus, PrythianDate } from "../types/calendar";
import { eventStatusOptions } from "../utils/eventStatus";

interface EventFormProps {
  date: PrythianDate;
  event?: CalendarEvent | null;
  onSubmit: (input: EventInput) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({ date, event, onSubmit, onCancel }: EventFormProps) {
  const [year, setYear] = useState(date.year);
  const [month, setMonth] = useState(date.month);
  const [day, setDay] = useState(date.day);
  const [title, setTitle] = useState("");
  const [rpUrl, setRpUrl] = useState("");
  const [participants, setParticipants] = useState("");
  const [status, setStatus] = useState<EventStatus>("ongoing");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(event);

  useEffect(() => {
    setYear(event?.year ?? date.year);
    setMonth(event?.month ?? date.month);
    setDay(event?.day ?? date.day);
    setTitle(event?.title ?? "");
    setRpUrl(event?.rpUrl ?? "");
    setParticipants(event?.participants.map((participant) => participant.name).join("\n") ?? "");
    setStatus(event?.status ?? "ongoing");
    setNotes(event?.notes ?? "");
  }, [date.day, date.month, date.year, event]);

  const participantList = useMemo(
    () =>
      participants
        .split("\n")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), name })),
    [participants],
  );

  const handleSubmit = async (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setIsSaving(true);

    try {
      await onSubmit({
        year,
        month,
        day,
        title,
        rpUrl,
        participants: participantList,
        status,
        notes: notes.trim() ? notes : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      {isEditing && (
        <fieldset className="event-date-fields">
          <legend>Data da RP</legend>
          <label className="field">
            <span>Ano</span>
            <input
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              required
            />
          </label>

          <label className="field">
            <span>Mês</span>
            <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {months.map((monthOption) => (
                <option key={monthOption.id} value={monthOption.id}>
                  {String(monthOption.id).padStart(2, "0")} - {monthOption.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Dia</span>
            <input
              type="number"
              min={1}
              max={DAYS_PER_MONTH}
              value={day}
              onChange={(event) => setDay(Number(event.target.value))}
              required
            />
          </label>
        </fieldset>
      )}

      <label className="field">
        <span>Título</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>

      <label className="field">
        <span>Link da RP</span>
        <input type="url" value={rpUrl} onChange={(event) => setRpUrl(event.target.value)} required />
      </label>

      <label className="field">
        <span>Participantes</span>
        <textarea
          value={participants}
          onChange={(event) => setParticipants(event.target.value)}
          placeholder={"Rhysand\nFeyre Archeron"}
          required
        />
      </label>

      <label className="field">
        <span>Status</span>
        <select value={status} onChange={(event) => setStatus(event.target.value as EventStatus)}>
          {eventStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Observações</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Ex.: Noite - RP fechada com Rhysand - Após o Calanmai."
        />
      </label>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="primary-button" type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : event ? "Salvar RP" : "Adicionar RP"}
        </button>
      </div>
    </form>
  );
}
