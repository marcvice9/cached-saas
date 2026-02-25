import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function handleLogout(request: Request) {
  const url = new URL(request.url);
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  // Use 303 so POST /auth/logout redirects to GET / and avoids 405.
  return NextResponse.redirect(new URL("/?logged_out=1", url.origin), 303);
}

export async function GET(request: Request) {
  return handleLogout(request);
}

export async function POST(request: Request) {
  return handleLogout(request);
}
