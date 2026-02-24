"use server";

import { createClient } from "@/lib/supabase/server";
import type { AISummary, ContentStatus, SavedContent } from "@/lib/types/database";

type ContentWithCategories = SavedContent & {
  categories?: { id: string; name: string }[];
  ai_summary?: AISummary | null;
};

export async function listContent(
  status?: ContentStatus
): Promise<ContentWithCategories[]> {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    // Dev-only stub so the dashboard renders without a database.
    const now = "2024-01-01T00:00:00.000Z";
    return [
      {
        id: "stub-content-1",
        user_id: "stub-user",
        title: "Transformers in Vision",
        url: "https://arxiv.org/abs/2010.11929",
        description: "Survey paper on applying transformers to computer vision tasks.",
        thumbnail_url: null,
        source_platform: "ARTICLE",
        content_format: "LONG_READ",
        estimated_duration_minutes: 25,
        categories: [{ id: "stub-cat-1", name: "AI/ML" }],
        status: "QUEUED",
        created_at: now,
        updated_at: now,
      },
      {
        id: "stub-content-2",
        user_id: "stub-user",
        title: "Practical CSS Grid tricks",
        url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
        description: "Reference guide and patterns for modern CSS Grid layout.",
        thumbnail_url: null,
        source_platform: "ARTICLE",
        content_format: "SHORT_READ",
        estimated_duration_minutes: 12,
        categories: [{ id: "stub-cat-2", name: "Frontend" }],
        status: "QUEUED",
        created_at: now,
        updated_at: now,
      },
    ] as ContentWithCategories[];
  }

  const supabase = await createClient();
  let query = supabase
    .from("saved_content")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const content = (data || []) as SavedContent[];
  if (!content.length) return [];

  const { data: catRows, error: catError } = await supabase
    .from("content_categories")
    .select("content_id, category:categories(id, name)")
    .in(
      "content_id",
      content.map((c) => c.id)
    );

  if (catError) throw new Error(catError.message);

  const catMap = new Map<string, { id: string; name: string }[]>();
  for (const row of catRows || []) {
    if (!row.category) continue;

    const rawCategory = Array.isArray(row.category)
      ? row.category[0]
      : row.category;
    if (!rawCategory) continue;

    const category = rawCategory as { id: string; name: string };
    const current = catMap.get(row.content_id) || [];
    current.push(category);
    catMap.set(row.content_id, current);
  }

  // Fetch AI summaries for all content items
  const { data: summaryRows } = await supabase
    .from("ai_summaries")
    .select("*")
    .in(
      "content_id",
      content.map((c) => c.id)
    );

  const summaryMap = new Map<string, AISummary>();
  for (const row of summaryRows || []) {
    summaryMap.set(row.content_id, row as AISummary);
  }

  return content.map((c) => ({
    ...c,
    categories: catMap.get(c.id) || [],
    ai_summary: summaryMap.get(c.id) ?? null,
  }));
}

export async function getContent(contentId: string): Promise<SavedContent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_content")
    .select("*")
    .eq("id", contentId)
    .single();

  if (error) throw new Error(error.message);
  return data as SavedContent;
}

export async function updateContentStatus(
  contentId: string,
  status: ContentStatus
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_content")
    .update({ status })
    .eq("id", contentId);

  if (error) throw new Error(error.message);
}

export async function deleteContent(contentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_content")
    .delete()
    .eq("id", contentId);

  if (error) throw new Error(error.message);
}
