import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveContentSchema } from "@/lib/validators/content";
import { extractMetadata } from "@/lib/ingestion";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(request: Request) {
  const useStubData =
    process.env.DISABLE_AUTH === "true" &&
    process.env.USE_STUB_DATA === "true";

  if (useStubData) {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      {
        data: {
          id: "stub-content-new",
          user_id: "stub-user",
          url: body.url ?? "https://example.com",
          title: body.url ?? "Saved link",
          description: "Stubbed content (auth disabled).",
          status: "QUEUED",
          created_at: "2024-01-01T00:00:00.000Z",
        },
      },
      { status: 201 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rl = checkRateLimit(`content-save:${user.id}`, RATE_LIMITS.CONTENT_SAVE);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 100 saves per day." },
      { status: 429 }
    );
  }

  // Validate input
  const body = await request.json();
  const parsed = saveContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { url, categoryIds } = parsed.data;

  // Extract metadata
  let metadata;
  try {
    metadata = await extractMetadata(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to extract metadata";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Insert content
  const { data: content, error: insertError } = await supabase
    .from("saved_content")
    .insert({
      user_id: user.id,
      url,
      title: metadata.title,
      description: metadata.description,
      thumbnail_url: metadata.thumbnailUrl,
      source_platform: metadata.sourcePlatform,
      content_format: metadata.contentFormat,
      estimated_duration_minutes: metadata.estimatedDurationMinutes,
      status: "QUEUED",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Link categories if provided
  if (categoryIds?.length) {
    const links = categoryIds.map((categoryId) => ({
      content_id: content.id,
      category_id: categoryId,
    }));
    await supabase.from("content_categories").insert(links);
  }

  return NextResponse.json({ data: content }, { status: 201 });
}
