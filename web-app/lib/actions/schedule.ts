"use server";

import { createClient } from "@/lib/supabase/server";
import { generateScheduleForUser } from "@/lib/scheduling/engine";
import { getWeekStartDate, formatDate } from "@/lib/scheduling/week-utils";
import type { ScheduledBlock, WeeklyGoalProgress } from "@/lib/types/database";

export async function generateSchedule(
  weekStartDate?: string
): Promise<{ blocksCreated: number }> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    return { blocksCreated: 0 };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: userData } = await supabase
    .from("users")
    .select("week_start_day")
    .eq("id", user.id)
    .single();

  const targetWeekStart =
    weekStartDate ||
    getWeekStartDate(new Date(), userData?.week_start_day || "SUNDAY");

  return generateScheduleForUser(supabase, user.id, targetWeekStart);
}

export async function getWeeklySchedule(
  weekStartDate?: string
): Promise<ScheduledBlock[]> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    const iso = "2024-01-01";
    return [
      {
        id: "stub-block-1",
        user_id: "stub-user",
        content_id: "stub-content-1",
        slot_id: "stub-slot-1",
        scheduled_date: iso,
        start_time: "08:00",
        end_time: "08:45",
        status: "QUEUED",
        created_at: iso,
        updated_at: iso,
        content: {
          id: "stub-content-1",
          user_id: "stub-user",
          category_id: "stub-cat-1",
          title: "Transformers in Vision",
          url: "https://arxiv.org/abs/2010.11929",
          status: "pending",
          created_at: iso,
          updated_at: iso,
        },
        slot: {
          id: "stub-slot-1",
          user_id: "stub-user",
          day_of_week: "MONDAY",
          start_time: "08:00",
          end_time: "09:00",
          label: "Morning deep work",
          allowed_formats: ["article", "video"],
          preferred_category_id: "stub-cat-1",
          is_active: true,
          created_at: iso,
          updated_at: iso,
        },
      },
    ] as unknown as ScheduledBlock[];
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: userData } = await supabase
    .from("users")
    .select("week_start_day")
    .eq("id", user.id)
    .single();

  const targetWeekStart =
    weekStartDate ||
    getWeekStartDate(new Date(), userData?.week_start_day || "SUNDAY");

  // Calculate week end
  const startDate = new Date(targetWeekStart + "T00:00:00");
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const { data, error } = await supabase
    .from("scheduled_blocks")
    .select("*, content:saved_content(*), slot:learning_slots(*)")
    .gte("scheduled_date", targetWeekStart)
    .lte("scheduled_date", formatDate(endDate))
    .order("scheduled_date")
    .order("start_time");

  if (error) throw new Error(error.message);
  return data as unknown as ScheduledBlock[];
}

export async function getTodaySchedule(): Promise<ScheduledBlock[]> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    return [];
  }

  const supabase = await createClient();
  const today = formatDate(new Date());

  const { data, error } = await supabase
    .from("scheduled_blocks")
    .select("*, content:saved_content(*)")
    .eq("scheduled_date", today)
    .order("start_time");

  if (error) throw new Error(error.message);
  return data as unknown as ScheduledBlock[];
}

export async function completeBlock(blockId: string): Promise<void> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";
  if (useStubData) return;

  const supabase = await createClient();

  const { data: block } = await supabase
    .from("scheduled_blocks")
    .select("*, content:saved_content(*)")
    .eq("id", blockId)
    .single();

  if (!block) throw new Error("Block not found");

  // Mark block as completed
  await supabase
    .from("scheduled_blocks")
    .update({ status: "COMPLETED", completed_at: new Date().toISOString() })
    .eq("id", blockId);

  // Mark content as consumed
  await supabase
    .from("saved_content")
    .update({ status: "CONSUMED" })
    .eq("id", block.content_id);

  // Update weekly goal progress completed_minutes
  const { data: contentCats } = await supabase
    .from("content_categories")
    .select("category_id")
    .eq("content_id", block.content_id);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from("users")
    .select("week_start_day")
    .eq("id", user!.id)
    .single();

  const weekStart = getWeekStartDate(
    new Date(block.scheduled_date),
    userData?.week_start_day || "SUNDAY"
  );

  for (const cc of contentCats || []) {
    const { data: progress } = await supabase
      .from("weekly_goal_progress")
      .select("*")
      .eq("user_id", user!.id)
      .eq("category_id", cc.category_id)
      .eq("week_start_date", weekStart)
      .single();

    if (progress) {
      await supabase
        .from("weekly_goal_progress")
        .update({
          completed_minutes:
            (progress as WeeklyGoalProgress).completed_minutes +
            (block.content as { estimated_duration_minutes: number })
              .estimated_duration_minutes,
        })
        .eq("id", progress.id);
    }
  }
}

export async function skipBlock(blockId: string): Promise<void> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";
  if (useStubData) return;

  const supabase = await createClient();

  const { data: block } = await supabase
    .from("scheduled_blocks")
    .select("content_id")
    .eq("id", blockId)
    .single();

  if (!block) throw new Error("Block not found");

  // Mark block as skipped
  await supabase
    .from("scheduled_blocks")
    .update({ status: "SKIPPED" })
    .eq("id", blockId);

  // Return content to queue
  await supabase
    .from("saved_content")
    .update({ status: "QUEUED" })
    .eq("id", block.content_id);
}
