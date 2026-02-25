import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sanitizeNextPath } from "@/lib/auth/redirect";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = sanitizeNextPath(searchParams.get("next"));
  const authDisabled = process.env.DISABLE_AUTH === "true";

  if (authDisabled) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  const cookieStore = await cookies();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // Ask GitHub to show account selection instead of silently reusing one.
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error || !data.url) {
      return NextResponse.redirect(`${origin}/?error=auth`);
    }

    return NextResponse.redirect(data.url);
  } catch {
    return NextResponse.redirect(`${origin}/?error=auth`);
  }
}
