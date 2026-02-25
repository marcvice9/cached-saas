import { createClient } from "@/lib/supabase/server";
import AppNavbar from "@/components/app/AppNavbar";

export const metadata = {
  title: "Dashboard | Cached",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = user
    ? await supabase
        .from("users")
        .select("name, email, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div
      className="relative min-h-screen overflow-x-clip"
      style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        background:
          "radial-gradient(900px 500px at 12% -10%, rgba(6,214,160,0.12), transparent 60%), radial-gradient(800px 520px at 88% -6%, rgba(167,139,250,0.14), transparent 62%), linear-gradient(180deg, #2A2D31 0%, #1F2226 45%, #1A1C1E 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-full opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <AppNavbar
        userName={userData?.name || undefined}
        userEmail={userData?.email || user?.email || undefined}
        avatarUrl={userData?.avatar_url}
      />

      <main className="relative pt-20">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
