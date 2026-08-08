import type { EventInput } from "../../../../src/types/calendar";
import { deleteEvent, NotFoundError, updateEvent, ValidationError } from "../../../_lib/calendarStorage";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function assertCanWrite(ownerId: string, req: any) {
  const rawViewerId = req.headers["x-viewer-id"];
  const viewerId = Array.isArray(rawViewerId) ? rawViewerId[0] : rawViewerId;
  if (viewerId !== ownerId) {
    const error = new Error("Forbidden") as Error & { status: number };
    error.status = 403;
    throw error;
  }
}

function getBody(req: any): Partial<EventInput> {
  if (typeof req.body === "string") {
    return JSON.parse(req.body) as Partial<EventInput>;
  }

  return (req.body ?? {}) as Partial<EventInput>;
}

function handleError(res: any, error: unknown) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return sendJson(res, error.status, { error: error.message });
  }

  if (error instanceof Error && "status" in error && error.status === 403) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  console.error(error);
  return sendJson(res, 500, { error: "Erro interno ao processar evento." });
}

export default async function handler(req: any, res: any) {
  const ownerId = getParam(req.query.ownerId);
  const eventId = getParam(req.query.eventId);

  if (!ownerId || !eventId) {
    return sendJson(res, 400, { error: "ownerId e eventId são obrigatórios." });
  }

  try {
    if (req.method === "PUT") {
      assertCanWrite(ownerId, req);
      const event = await updateEvent(ownerId, eventId, getBody(req));
      return sendJson(res, 200, event);
    }

    if (req.method === "DELETE") {
      assertCanWrite(ownerId, req);
      await deleteEvent(ownerId, eventId);
      return sendJson(res, 200, { ok: true });
    }

    res.setHeader("Allow", "PUT, DELETE");
    return sendJson(res, 405, { error: "Método não permitido." });
  } catch (error) {
    return handleError(res, error);
  }
}
