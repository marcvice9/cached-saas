import { z } from "zod";
import { CONTENT_LIMITS } from "../constants";

export const saveContentSchema = z.object({
  url: z
    .string()
    .url("Must be a valid URL")
    .max(CONTENT_LIMITS.MAX_URL_LENGTH),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateContentStatusSchema = z.object({
  contentId: z.string().uuid(),
  status: z.enum(["QUEUED", "SCHEDULED", "CONSUMED", "SKIPPED", "ARCHIVED"]),
});

export const deleteContentSchema = z.object({
  contentId: z.string().uuid(),
});

export type SaveContentInput = z.infer<typeof saveContentSchema>;
export type UpdateContentStatusInput = z.infer<typeof updateContentStatusSchema>;
