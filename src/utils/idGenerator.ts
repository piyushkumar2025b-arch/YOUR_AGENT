import { nanoid } from "nanoid";

export function generateUniqueId(prefix?: string, length = 10): string {
  const id = nanoid(length);
  return prefix ? `${prefix}_${id}` : id;
}

export function generateSessionToken(): string {
  return nanoid(21);
}
