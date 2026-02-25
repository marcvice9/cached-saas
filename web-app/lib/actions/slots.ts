"use server";

import { createClient } from "@/lib/supabase/server";
import type { LearningSlot } from "@/lib/types/database";
import type { CreateSlotInput, UpdateSlotInput } from "@/lib/validators/slot";

export async function listSlots(activeOnly = true): Promise<LearningSlot[]> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    const now = "2024-01-01T00:00:00.000Z";
    return [
      {
        id: "stub-slot-1",
        user_id: "stub-user",
        day_of_week: "MONDAY",
        start_time: "08:00",
        end_time: "09:00",
        label: "Morning deep work",
        allowed_formats: ["LONG_READ", "VIDEO"],
        preferred_category_id: "stub-cat-1",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "stub-slot-2",
        user_id: "stub-user",
        day_of_week: "WEDNESDAY",
        start_time: "19:00",
        end_time: "20:00",
        label: "Evening learn",
        allowed_formats: ["SHORT_READ", "AUDIO"],
        preferred_category_id: "stub-cat-2",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ] as LearningSlot[];
  }

  const supabase = await createClient();
  let query = supabase.from("learning_slots").select("*").order("day_of_week");

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as LearningSlot[];
}

export async function createSlot(input: CreateSlotInput): Promise<LearningSlot> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    const now = "2024-01-01T00:00:00.000Z";
    return {
      id: "stub-new-slot",
      user_id: "stub-user",
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
      label: input.label ?? null,
      allowed_formats: input.allowedFormats ?? null,
      preferred_category_id: input.preferredCategoryId ?? null,
      is_active: input.isActive,
      created_at: now,
      updated_at: now,
    } as LearningSlot;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check for overlapping slots on the same day
  const { data: existing } = await supabase
    .from("learning_slots")
    .select("*")
    .eq("day_of_week", input.dayOfWeek)
    .eq("is_active", true);

  const overlap = (existing || []).some(
    (slot: LearningSlot) =>
      input.startTime < slot.end_time && input.endTime > slot.start_time
  );

  if (overlap) {
    throw new Error("This slot overlaps with an existing slot on the same day");
  }

  const { data, error } = await supabase
    .from("learning_slots")
    .insert({
      user_id: user.id,
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
      label: input.label ?? null,
      allowed_formats: input.allowedFormats ?? null,
      preferred_category_id: input.preferredCategoryId ?? null,
      is_active: input.isActive,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as LearningSlot;
}

export async function updateSlot(input: UpdateSlotInput): Promise<LearningSlot> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    const now = "2024-01-01T00:00:00.000Z";
    // Return a merged stub without hitting DB.
    return {
      id: input.id,
      user_id: "stub-user",
      day_of_week: input.dayOfWeek ?? "MONDAY",
      start_time: input.startTime ?? "08:00",
      end_time: input.endTime ?? "09:00",
      label: input.label ?? "Updated slot",
      allowed_formats: input.allowedFormats ?? ["LONG_READ"],
      preferred_category_id: input.preferredCategoryId ?? "stub-cat-1",
      is_active: input.isActive ?? true,
      created_at: now,
      updated_at: now,
    } as LearningSlot;
  }

  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (input.dayOfWeek !== undefined) updates.day_of_week = input.dayOfWeek;
  if (input.startTime !== undefined) updates.start_time = input.startTime;
  if (input.endTime !== undefined) updates.end_time = input.endTime;
  if (input.label !== undefined) updates.label = input.label;
  if (input.allowedFormats !== undefined) updates.allowed_formats = input.allowedFormats;
  if (input.preferredCategoryId !== undefined)
    updates.preferred_category_id = input.preferredCategoryId;
  if (input.isActive !== undefined) updates.is_active = input.isActive;

  const { data, error } = await supabase
    .from("learning_slots")
    .update(updates)
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as LearningSlot;
}

export async function deleteSlot(slotId: string): Promise<void> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("learning_slots")
    .delete()
    .eq("id", slotId);

  if (error) throw new Error(error.message);
}
