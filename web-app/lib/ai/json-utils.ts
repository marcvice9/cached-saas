import type { ZodSchema } from "zod";

function extractJsonString(raw: string): string {
  const trimmed = raw.trim();

  // Prefer fenced code blocks (```json ... ```)
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  // Fall back to the first JSON object we can spot
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

export function parseModelJson<T>(raw: string, schema: ZodSchema<T>): T {
  const candidate = extractJsonString(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (error) {
    throw new Error(
      `Failed to parse model JSON: ${(error as Error).message}. Raw: ${raw}`
    );
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Model JSON did not match schema: ${result.error.message}`);
  }

  return result.data;
}
