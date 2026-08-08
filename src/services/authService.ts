import type { AuthUser, CalendarContextState, CalendarOwner, Permission } from "../types/calendar";
import { getForumIdentity } from "./forumIdentity";

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const identity = getForumIdentity();
  if (!identity) {
    return null;
  }

  return {
    id: identity.viewerId,
    displayName: `Usuário ${identity.viewerId}`,
  };
}

export async function getCalendarOwnerFromRequest(): Promise<CalendarOwner | null> {
  const identity = getForumIdentity();
  if (!identity) {
    return null;
  }

  return {
    id: identity.ownerId,
    displayName: identity.characterName,
    characterName: identity.characterName,
  };
}

export function resolvePermission(authenticatedUser: AuthUser | null, owner: CalendarOwner): Permission {
  if (!authenticatedUser) {
    return "unauthenticated";
  }

  return authenticatedUser.id === owner.id ? "owner" : "viewer";
}

export async function getCalendarContext(): Promise<CalendarContextState | null> {
  const identity = getForumIdentity();
  if (!identity) {
    return null;
  }

  const authenticatedUser: AuthUser = {
    id: identity.viewerId,
    displayName: `Usuário ${identity.viewerId}`,
  };

  const owner: CalendarOwner = {
    id: identity.ownerId,
    displayName: identity.characterName,
    characterName: identity.characterName,
  };

  return {
    authenticatedUser,
    owner,
    viewerId: authenticatedUser.id,
    permission: resolvePermission(authenticatedUser, owner),
  };
}
