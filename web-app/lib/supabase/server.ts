import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const authDisabled = process.env.DISABLE_AUTH === "true";

  // Dev mode: bypass auth/RLS using the service role and a fixed demo user.
  if (authDisabled) {
    const demoUserId =
      process.env.DEMO_USER_ID || "00000000-0000-0000-0000-000000000000";

    const serviceClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // no-op in auth-disabled mode
          },
        },
      }
    );

    // Monkey-patch getUser so existing code paths keep working.
    (serviceClient as any).auth.getUser = async () => ({
      data: {
        user: {
          id: demoUserId,
          email: "demo@cached.dev",
        },
      },
      error: null,
    });

    return serviceClient;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if middleware refreshes sessions.
          }
        },
      },
    }
  );
}

/**
 * Service-role client for admin operations (cron jobs, webhooks).
 * Bypasses RLS — use with caution.
 */
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
