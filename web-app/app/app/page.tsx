import Link from "next/link";
import { listCategories } from "@/lib/actions/categories";
import { listSlots } from "@/lib/actions/slots";
import { getTodaySchedule, getWeeklySchedule } from "@/lib/actions/schedule";
import { listContent } from "@/lib/actions/content";
import { syncCurrentUserStripeSubscription } from "@/lib/actions/billing";
import HomeSaveHero from "@/components/app/HomeSaveHero";
import TodayPlan from "@/components/app/TodayPlan";

const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

function getMondayStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  if (params?.checkout === "success") {
    await syncCurrentUserStripeSubscription();
  }

  const mondayStart = getMondayStart(new Date());

  const [categories, slots, todayBlocks, weeklyBlocks, recentContent] = await Promise.all([
    listCategories(),
    listSlots(),
    getTodaySchedule(),
    getWeeklySchedule(mondayStart),
    listContent(),
  ]);

  const groupedSlots = DAY_ORDER.flatMap((day) =>
    slots
      .filter((slot) => slot.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map((slot) => ({
        id: slot.id,
        day,
        label: slot.label || "Learning Block",
        window: `${slot.start_time} - ${slot.end_time}`,
      }))
  );

  const completedBlocks = (weeklyBlocks as any[]).filter((b) => b.status === "COMPLETED");
  const investedThisWeek = completedBlocks.reduce((sum, b) => {
    const mins = b.content?.estimated_duration_minutes || 0;
    return sum + mins;
  }, 0);

  const scheduledThisWeek = (weeklyBlocks as any[]).reduce((sum, b) => {
    const [sh, sm] = b.start_time.split(":").map(Number);
    const [eh, em] = b.end_time.split(":").map(Number);
    return sum + (eh * 60 + em - (sh * 60 + sm));
  }, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const savedThisWeek = recentContent.filter((c) => new Date(c.created_at) >= weekAgo).length;

  const completedDays = new Set(completedBlocks.map((b) => b.scheduled_date));
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    if (completedDays.has(date)) streak += 1;
    else break;
  }

  const trackerPercent = scheduledThisWeek === 0 ? 0 : Math.min(100, Math.round((investedThisWeek / scheduledThisWeek) * 100));

  return (
    <div className="space-y-6">
      <HomeSaveHero
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />

      <section className="rounded-3xl border border-white/10 bg-[#202327] p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Weekly Tracker</h2>
          <span className="rounded-xl bg-[#06D6A0] px-3 py-1 text-xs font-semibold text-[#0E2E29]">
            {trackerPercent}% complete
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-[#06D6A0]"
            style={{ width: `${trackerPercent}%` }}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#272C31] p-3">
            <p className="text-xs text-zinc-400">Saved This Week</p>
            <p className="mt-1 text-lg font-semibold text-white">{savedThisWeek}</p>
          </div>
          <div className="rounded-xl bg-[#272C31] p-3">
            <p className="text-xs text-zinc-400">Time Invested This Week</p>
            <p className="mt-1 text-lg font-semibold text-white">{investedThisWeek} min</p>
          </div>
          <div className="rounded-xl bg-[#272C31] p-3">
            <p className="text-xs text-zinc-400">Learning Streak</p>
            <p className="mt-1 text-lg font-semibold text-white">{streak} days</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#202327] p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Learning Slots</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Your notebook availability grid.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#A78BFA]/15 px-3 py-1 text-xs font-medium text-[#DDD4FF]">
              {groupedSlots.length} slots
            </span>
            <Link
              href="/app/schedule#learning-slots"
              className="rounded-xl bg-[#06D6A0] px-3 py-1.5 text-xs font-semibold text-[#0E2E29]"
            >
              + Add Slot
            </Link>
          </div>
        </div>

        {groupedSlots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/35 bg-[#1A1C1E] px-4 py-8 text-center text-sm text-zinc-400">
            Add learning blocks in Schedule to start planning.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupedSlots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-2xl border border-dashed border-white/45 bg-white/[0.03] p-4"
              >
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-300">
                  <span>{DAY_LABELS[slot.day]}</span>
                  <span className="text-[#06D6A0]">{slot.window}</span>
                </div>
                <p className="text-sm font-medium text-white">{slot.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <TodayPlan blocks={todayBlocks as any} />
    </div>
  );
}
