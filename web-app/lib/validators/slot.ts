import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createSlotSchema = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    startTime: z.string().regex(timeRegex, "Must be HH:MM format"),
    endTime: z.string().regex(timeRegex, "Must be HH:MM format"),
    label: z.string().max(100).optional(),
    allowedFormats: z
      .array(z.enum(["VIDEO", "AUDIO", "LONG_READ", "SHORT_READ", "CODE_REPO"]))
      .optional(),
    preferredCategoryId: z.string().uuid().optional(),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime must be before endTime",
    path: ["endTime"],
  });

export const updateSlotSchema = z.object({
  id: z.string().uuid(),
  dayOfWeek: z
    .enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ])
    .optional(),
  startTime: z.string().regex(timeRegex, "Must be HH:MM format").optional(),
  endTime: z.string().regex(timeRegex, "Must be HH:MM format").optional(),
  label: z.string().max(100).nullable().optional(),
  allowedFormats: z
    .array(z.enum(["VIDEO", "AUDIO", "LONG_READ", "SHORT_READ", "CODE_REPO"]))
    .nullable()
    .optional(),
  preferredCategoryId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
