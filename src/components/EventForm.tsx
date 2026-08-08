import { useEffect, useMemo, useState } from "react";
import type { CalendarEvent, EventInput, EventStatus, PrythianDate } from "../types/calendar";
import { eventStatusOptions } from "../utils/eventStatus";

interface EventFormProps {
  date: PrythianDate;
  event?: CalendarEvent | null;
  onSubmit: (input: EventInput) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({ date, event, onSubmit, onCancel }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [rpUrl, setRpUrl] = useState("");
  const [participants, setParticipants] = useState("");
  const [status, setStatus] = useState<EventStatus>("ongoing");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(event?.title ?? "");
    setRpUrl(event?.rpUrl ?? "");
    setParticipants(event?.participants.map((participant) => participant.name).join("\n") ?? "");
    setStatus(event?.status ?? "ongoing");
    setNotes(event?.notes ?? "");
  }, [event]);

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

    await onSubmit({
      ...date,
      title,
      rpUrl,
      participants: participantList,
      status,
      notes: notes.trim() ? notes : undefined,
    });

    setIsSaving(false);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
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
          placeholder="Ex.: Noite • RP fechada com Rhysand • Após o Calanmai."
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
