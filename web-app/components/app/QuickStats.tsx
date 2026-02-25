export default function QuickStats({
  savedThisWeek,
  scheduledMinutes,
  streak,
}: {
  savedThisWeek: number;
  scheduledMinutes: number;
  streak: number;
}) {
  const stats = [
    { label: "Saved this week", value: savedThisWeek },
    { label: "Minutes scheduled", value: scheduledMinutes },
    { label: "Day streak", value: streak },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl bg-brand-surface p-4 text-center shadow-sm"
        >
          <p className="text-2xl font-bold text-white">{s.value}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
