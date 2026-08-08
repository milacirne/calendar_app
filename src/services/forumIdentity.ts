export function getForumUserId(search = window.location.search): string | null {
  const params = new URLSearchParams(search);
  return params.get("uid");
}

export function getForumViewerId(search = window.location.search): string | null {
  const params = new URLSearchParams(search);
  return params.get("viewer");
}
