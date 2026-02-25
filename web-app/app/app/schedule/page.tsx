import { getWeeklySchedule } from "@/lib/actions/schedule";
import { listSlots } from "@/lib/actions/slots";
import { listCategories } from "@/lib/actions/categories";
import ScheduleView from "@/components/app/ScheduleView";
import SlotManager from "@/components/app/SlotManager";

function getWeekStartDate(date: Date): string {
  const d = new Date(date);
  const currentDay = d.getDay();
  const startDay = 1;
  const diff = (currentDay - startDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

function normalizeToMonday(week?: string): string {
  if (!week) return getWeekStartDate(new Date());
  const parsed = new Date(`${week}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return getWeekStartDate(new Date());
  return getWeekStartDate(parsed);
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;

  const weekStart = normalizeToMonday(params.week);

  const [blocks, learningSlots, categories] = await Promise.all([
    getWeeklySchedule(weekStart),
    listSlots(false),
    listCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">The Sticky Note Planner</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Fill your user-defined learning blocks with one click.
        </p>
      </div>

      <ScheduleView
        initialBlocks={blocks as any}
        learningSlots={learningSlots}
        weekStartDate={weekStart}
      />

      <section id="learning-slots" className="rounded-3xl border border-white/10 bg-[#202327] p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Learning Slots</h2>
          <p className="mt-1 text-sm text-zinc-400">Manage your availability directly from Schedule.</p>
        </div>
        <SlotManager initialSlots={learningSlots} categories={categories} />
      </section>
    </div>
  );
}
