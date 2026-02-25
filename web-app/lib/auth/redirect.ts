const DEFAULT_NEXT = "/app";

export function sanitizeNextPath(nextValue: string | null): string {
  if (!nextValue) return DEFAULT_NEXT;
  if (!nextValue.startsWith("/")) return DEFAULT_NEXT;
  if (nextValue.startsWith("//")) return DEFAULT_NEXT;
  if (nextValue.startsWith("/auth")) return DEFAULT_NEXT;

  return nextValue;
}
