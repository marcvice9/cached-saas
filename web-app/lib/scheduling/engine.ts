import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  LearningSlot,
  SavedContent,
  ContentCategory,
  ContentFormat,
} from "../types/database";
import {
  getDateForDayInWeek,
  slotDurationMinutes,
} from "./week-utils";

interface ExpandedSlot {
  slot: LearningSlot;
  date: string;
  durationMinutes: number;
}

interface ContentWithCategories extends SavedContent {
  categoryIds: string[];
}

/**
 * Core scheduling algorithm — greedy, single-pass slot-filling.
 *
 * 1. Fetch active slots → expand to concrete dates for target week
 * 2. Delete existing UPCOMING blocks for idempotency
 * 3. Fetch QUEUED content, sort by category deficit DESC then savedAt ASC
 * 4. For each slot: find matching content (format, duration, variety)
 * 5. Create scheduled_blocks, update content status, update weekly_goal_progress
 */
export async function generateScheduleForUser(
  supabase: SupabaseClient,
  userId: string,
  weekStartDate: string
): Promise<{ blocksCreated: number }> {
  // 1. Get active slots and expand to concrete dates
  const { data: slots } = await supabase
    .from("learning_slots")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (!slots?.length) return { blocksCreated: 0 };

  const expandedSlots: ExpandedSlot[] = (slots as LearningSlot[])
    .map((slot) => ({
      slot,
      date: getDateForDayInWeek(weekStartDate, slot.day_of_week),
      durationMinutes: slotDurationMinutes(slot.start_time, slot.end_time),
    }))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.slot.start_time.localeCompare(b.slot.start_time);
    });

  // 2. Delete existing UPCOMING blocks for this week (idempotency)
  const weekDates = expandedSlots.map((s) => s.date);
  const minDate = weekDates[0];
  const maxDate = weekDates[weekDates.length - 1];

  await supabase
    .from("scheduled_blocks")
    .delete()
    .eq("user_id", userId)
    .eq("status", "UPCOMING")
    .gte("scheduled_date", minDate)
    .lte("scheduled_date", maxDate);

  // Reset content that was SCHEDULED back to QUEUED
  // (only for content whose blocks we just deleted)
  const { data: scheduledContent } = await supabase
    .from("saved_content")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "SCHEDULED");

  if (scheduledContent?.length) {
    // Check which scheduled content no longer has any blocks
    for (const sc of scheduledContent) {
      const { count } = await supabase
        .from("scheduled_blocks")
        .select("*", { count: "exact", head: true })
        .eq("content_id", sc.id)
        .neq("status", "SKIPPED");

      if (count === 0) {
        await supabase
          .from("saved_content")
          .update({ status: "QUEUED" })
          .eq("id", sc.id);
      }
    }
  }

  // 3. Fetch QUEUED content with their categories
  const { data: queuedContent } = await supabase
    .from("saved_content")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "QUEUED")
    .order("created_at", { ascending: true });

  if (!queuedContent?.length) return { blocksCreated: 0 };

  const { data: contentCats } = await supabase
    .from("content_categories")
    .select("*");

  const catMap = new Map<string, string[]>();
  for (const cc of (contentCats || []) as ContentCategory[]) {
    const existing = catMap.get(cc.content_id) || [];
    existing.push(cc.category_id);
    catMap.set(cc.content_id, existing);
  }

  const contentQueue: ContentWithCategories[] = (
    queuedContent as SavedContent[]
  ).map((c) => ({
    ...c,
    categoryIds: catMap.get(c.id) || [],
  }));

  // Get category budgets for deficit calculation
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  const categoryBudgets = new Map<string, number>();
  const categoryScheduled = new Map<string, number>();

  for (const cat of categories || []) {
    categoryBudgets.set(cat.id, cat.weekly_time_budget_minutes || 0);
    categoryScheduled.set(cat.id, 0);
  }

  // Sort by category deficit (higher deficit first)
  // For content with multiple categories, use the max deficit
  function getMaxDeficit(content: ContentWithCategories): number {
    if (!content.categoryIds.length) return 0;
    return Math.max(
      ...content.categoryIds.map((catId) => {
        const budget = categoryBudgets.get(catId) || 0;
        const scheduled = categoryScheduled.get(catId) || 0;
        return budget - scheduled;
      })
    );
  }

  // 4. Fill slots
  const usedContentIds = new Set<string>();
  const blocksToCreate: Array<{
    user_id: string;
    content_id: string;
    slot_id: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    status: string;
  }> = [];
  let lastCategoryId: string | null = null;

  for (const expanded of expandedSlots) {
    // Re-sort queue by deficit before each slot
    contentQueue.sort((a, b) => getMaxDeficit(b) - getMaxDeficit(a));

    const allowedFormats = expanded.slot.allowed_formats as ContentFormat[] | null;
    const slotDuration = expanded.durationMinutes;

    let selectedContent: ContentWithCategories | null = null;

    // Try to find content that doesn't repeat the last category (soft rule)
    for (const content of contentQueue) {
      if (usedContentIds.has(content.id)) continue;
      if (content.estimated_duration_minutes > slotDuration) continue;
      if (
        allowedFormats?.length &&
        !allowedFormats.includes(content.content_format)
      )
        continue;

      // Soft variety: skip if same category as last, unless no alternative
      if (
        lastCategoryId &&
        content.categoryIds.length === 1 &&
        content.categoryIds[0] === lastCategoryId
      ) {
        // Check if there's an alternative
        const hasAlternative = contentQueue.some(
          (c) =>
            !usedContentIds.has(c.id) &&
            c.id !== content.id &&
            c.estimated_duration_minutes <= slotDuration &&
            (!allowedFormats?.length ||
              allowedFormats.includes(c.content_format)) &&
            !(
              c.categoryIds.length === 1 &&
              c.categoryIds[0] === lastCategoryId
            )
        );
        if (hasAlternative) continue;
      }

      selectedContent = content;
      break;
    }

    if (!selectedContent) continue;

    usedContentIds.add(selectedContent.id);
    lastCategoryId = selectedContent.categoryIds[0] ?? null;

    // Update category scheduled minutes
    for (const catId of selectedContent.categoryIds) {
      const current = categoryScheduled.get(catId) || 0;
      categoryScheduled.set(
        catId,
        current + selectedContent.estimated_duration_minutes
      );
    }

    blocksToCreate.push({
      user_id: userId,
      content_id: selectedContent.id,
      slot_id: expanded.slot.id,
      scheduled_date: expanded.date,
      start_time: expanded.slot.start_time,
      end_time: expanded.slot.end_time,
      status: "UPCOMING",
    });
  }

  if (!blocksToCreate.length) return { blocksCreated: 0 };

  // 5. Insert blocks
  const { error: blockError } = await supabase
    .from("scheduled_blocks")
    .insert(blocksToCreate);

  if (blockError) throw new Error(blockError.message);

  // Update content statuses to SCHEDULED
  const scheduledIds = blocksToCreate.map((b) => b.content_id);
  await supabase
    .from("saved_content")
    .update({ status: "SCHEDULED" })
    .in("id", scheduledIds);

  // 6. Upsert weekly_goal_progress
  for (const [catId, minutes] of categoryScheduled.entries()) {
    if (minutes === 0) continue;

    await supabase.from("weekly_goal_progress").upsert(
      {
        user_id: userId,
        category_id: catId,
        week_start_date: weekStartDate,
        scheduled_minutes: minutes,
      },
      { onConflict: "user_id,category_id,week_start_date" }
    );
  }

  return { blocksCreated: blocksToCreate.length };
}
