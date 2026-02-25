import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  goalDescription: z.string().max(500).optional(),
  weeklyTimeBudgetMinutes: z.number().int().min(0).max(10080).optional(),
  priority: z.number().int().min(0).max(100).default(0),
});

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  goalDescription: z.string().max(500).nullable().optional(),
  weeklyTimeBudgetMinutes: z.number().int().min(0).max(10080).nullable().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
