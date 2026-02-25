import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function handleLogout(request: Request) {
  const url = new URL(request.url);
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL("/?logged_out=1", url.origin));
}

export async function GET(request: Request) {
  return handleLogout(request);
}

export async function POST(request: Request) {
  return handleLogout(request);
}
