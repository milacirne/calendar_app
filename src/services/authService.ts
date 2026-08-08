import type { AuthUser, CalendarContextState, CalendarOwner, Permission } from "../types/calendar";
import { getForumUserId, getForumViewerId } from "./forumIdentity";

const MOCK_AUTHENTICATED_USER: AuthUser = {
  id: "123",
  displayName: "Jogadora de Aisling",
};

const DEFAULT_OWNER: CalendarOwner = {
  id: "123",
  displayName: "Jogadora de Aisling",
  characterName: "Aisling",
};

const KNOWN_OWNERS: Record<string, CalendarOwner> = {
  "123": DEFAULT_OWNER,
  "456": {
    id: "456",
    displayName: "Jogador de Bastian",
    characterName: "Bastian",
  },
};

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const viewerId = getForumViewerId();
  return viewerId ? { ...MOCK_AUTHENTICATED_USER, id: viewerId } : MOCK_AUTHENTICATED_USER;
}

export async function getCalendarOwnerFromRequest(): Promise<CalendarOwner> {
  const requestedOwnerId = getForumUserId();
  return requestedOwnerId ? KNOWN_OWNERS[requestedOwnerId] ?? { ...DEFAULT_OWNER, id: requestedOwnerId } : DEFAULT_OWNER;
}

export function resolvePermission(authenticatedUser: AuthUser | null, owner: CalendarOwner): Permission {
  if (!authenticatedUser) {
    return "unauthenticated";
  }

  return authenticatedUser.id === owner.id ? "owner" : "viewer";
}

export async function getCalendarContext(): Promise<CalendarContextState> {
  const [authenticatedUser, owner] = await Promise.all([getAuthenticatedUser(), getCalendarOwnerFromRequest()]);

  return {
    authenticatedUser,
    owner,
    viewerId: authenticatedUser?.id ?? null,
    permission: resolvePermission(authenticatedUser, owner),
  };
}
