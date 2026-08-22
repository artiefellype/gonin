import { UserProps } from "@/types";

const USERNAME_PATTERN = /^[a-z0-9._-]{2,32}$/;

export const normalizeSearchText = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const normalizeUsername = (value?: string | null) =>
  normalizeSearchText(value)
    .replace(/^@+/, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 32);

export const buildUsernameCandidate = (
  value?: string | null,
  fallback?: string | null
) => {
  const source = value?.trim() || fallback?.split("@")[0] || "usuario";
  return normalizeUsername(source) || "usuario";
};

export const isValidUsername = (value?: string | null) => {
  const cleanValue = (value || "").trim();
  const withoutAt = cleanValue.replace(/^@+/, "");
  const normalizedInput = normalizeSearchText(withoutAt);

  if (!withoutAt || /\s/.test(withoutAt)) return false;
  if (/[^a-z0-9._-]/.test(normalizedInput)) return false;

  return USERNAME_PATTERN.test(normalizeUsername(withoutAt));
};

export const getDisplayNameFallback = (
  displayName?: string | null,
  email?: string | null
) => displayName?.trim() || email?.split("@")[0] || "Usuário";

export const hydrateUserIdentity = <T extends Partial<UserProps>>(user: T): T => {
  const displayName = getDisplayNameFallback(user.displayName, user.email);
  const username = user.username || buildUsernameCandidate(displayName, user.email);

  return {
    ...user,
    displayName,
    searchName: user.searchName || normalizeSearchText(displayName),
    username,
    searchUsername: user.searchUsername || normalizeUsername(username),
  };
};
