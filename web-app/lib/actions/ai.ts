"use server";

import { createClient } from "@/lib/supabase/server";
import type { AISummary, AISummaryWithContent } from "@/lib/types/database";

export async function getSummaryForContent(
  contentId: string
): Promise<AISummary | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_summaries")
    .select("*")
    .eq("content_id", contentId)
    .single();

  return (data as AISummary) ?? null;
}

export async function searchVault(query: string): Promise<AISummaryWithContent[]> {
  const supabase = await createClient();

  // Use PostgreSQL full-text search
  const tsQuery = query
    .trim()
    .split(/\s+/)
    .map((word) => `${word}:*`)
    .join(" & ");

  const { data, error } = await supabase
    .from("ai_summaries")
    .select("*, content:saved_content(id, title, url, status)")
    .textSearch("search_vector", tsQuery)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as AISummaryWithContent[]).filter(
    (s) => s.content?.status === "CONSUMED"
  );
}

export async function updateSummaryNotes(
  summaryId: string,
  userNotes: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_summaries")
    .update({ user_notes: userNotes })
    .eq("id", summaryId);

  if (error) throw new Error(error.message);
}

export async function listVaultSummaries(): Promise<AISummaryWithContent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_summaries")
    .select("*, content:saved_content(id, title, url, status)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Only surface summaries for consumed content
  return (data as AISummaryWithContent[]).filter(
    (s) => s.content?.status === "CONSUMED"
  );
}
