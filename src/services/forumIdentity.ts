import type { ForumIdentity } from "../types/calendar";

const FORUM_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function normalizeParam(value: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized || null;
}

export function isValidForumId(value: string | null): value is string {
  return Boolean(value && FORUM_ID_PATTERN.test(value));
}

export function getForumUserId(search = window.location.search): string | null {
  const params = new URLSearchParams(search);
  return normalizeParam(params.get("uid"));
}

export function getForumViewerId(search = window.location.search): string | null {
  const params = new URLSearchParams(search);
  return normalizeParam(params.get("viewer"));
}

export function getForumCharacterName(search = window.location.search): string | null {
  const params = new URLSearchParams(search);
  return normalizeParam(params.get("name"));
}

export function getForumIdentity(search = window.location.search): ForumIdentity | null {
  const ownerId = getForumUserId(search);
  const viewerId = getForumViewerId(search);
  const characterName = getForumCharacterName(search);

  if (!isValidForumId(ownerId) || !isValidForumId(viewerId) || !characterName) {
    return null;
  }

  return {
    ownerId,
    viewerId,
    characterName,
  };
}
