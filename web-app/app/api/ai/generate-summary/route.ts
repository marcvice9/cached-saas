import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSummary } from "@/lib/ai/summary-generate";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";
import { z } from "zod";
import { getEffectivePlan } from "@/lib/billing/effective-plan";

const requestSchema = z.object({
  contentId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getEffectivePlan(supabase, user.id);

  const limit =
    plan === "PRO"
      ? RATE_LIMITS.AI_SUMMARY_PRO
      : RATE_LIMITS.AI_SUMMARY_FREE;

  const rl = checkRateLimit(`ai-summary:${user.id}`, limit);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 50 summaries per day." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Fetch the content
  const { data: content, error: contentError } = await supabase
    .from("saved_content")
    .select("*")
    .eq("id", parsed.data.contentId)
    .single();

  if (contentError || !content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  // Generate summary
  const summary = await generateSummary(
    content.title,
    content.description,
    content.url
  );

  // Save to ai_summaries
  const { data: savedSummary, error: saveError } = await supabase
    .from("ai_summaries")
    .insert({
      content_id: content.id,
      user_id: user.id,
      summary_text: summary.summaryText,
      key_takeaways: summary.keyTakeaways,
      suggested_topics: summary.suggestedTopics,
    })
    .select()
    .single();

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 });
  }

  return NextResponse.json({ data: savedSummary }, { status: 201 });
}
