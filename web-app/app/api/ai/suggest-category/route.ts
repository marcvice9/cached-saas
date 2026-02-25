import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { suggestCategory } from "@/lib/ai/category-suggest";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";
import { z } from "zod";

const requestSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(
    `ai-category:${user.id}`,
    RATE_LIMITS.AI_CATEGORY_SUGGEST
  );
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Fetch user's existing categories
  const { data: categories } = await supabase
    .from("categories")
    .select("name")
    .eq("is_active", true);

  const existingNames = (categories || []).map((c: { name: string }) => c.name);

  const suggestion = await suggestCategory(
    parsed.data.title,
    parsed.data.description ?? null,
    existingNames
  );

  return NextResponse.json({ data: suggestion });
}
