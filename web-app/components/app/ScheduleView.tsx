"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  ScheduledBlock,
  SavedContent,
  LearningSlot,
  DayOfWeek,
} from "@/lib/types/database";
import {
  generateSchedule,
  completeBlock,
  skipBlock,
} from "@/lib/actions/schedule";
import { sendScheduleDigest } from "@/lib/actions/email";

type BlockWithRelations = ScheduledBlock & {
  content: SavedContent;
  slot: LearningSlot | null;
};

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function getWeekLabel(weekStartDate: string): string {
  const start = new Date(weekStartDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

function getDayOfWeek(dateStr: string): DayOfWeek {
  const day = new Date(dateStr + "T00:00:00").getDay();
  const map: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return map[day];
}

export default function ScheduleView({
  initialBlocks,
  learningSlots,
  weekStartDate,
}: {
  initialBlocks: BlockWithRelations[];
  learningSlots: LearningSlot[];
  weekStartDate: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSending, startSendingTransition] = useTransition();
  const [currentWeekStart, setCurrentWeekStart] = useState(weekStartDate);
  const [error, setError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<
    "idle" | "sending" | "sent" | "empty" | "error"
  >("idle");
  const [sendMessage, setSendMessage] = useState<string | null>(null);
  const [fillAnimationOn, setFillAnimationOn] = useState(false);

  const blocksByDate = initialBlocks.reduce(
    (acc, block) => {
      const date = block.scheduled_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(block);
      return acc;
    },
    {} as Record<string, BlockWithRelations[]>
  );

  const weekDates: string[] = [];
  const startDate = new Date(currentWeekStart + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  const navigateWeek = (direction: -1 | 1) => {
    const d = new Date(currentWeekStart + "T00:00:00");
    d.setDate(d.getDate() + direction * 7);
    const newStart = d.toISOString().split("T")[0];
    setCurrentWeekStart(newStart);
    const params = new URLSearchParams({ week: newStart });
    router.push(`/app/schedule?${params.toString()}`);
    router.refresh();
  };

  const handleGenerate = () => {
    setError(null);
    setFillAnimationOn(true);

    startTransition(async () => {
      try {
        const result = await generateSchedule(currentWeekStart);
        router.refresh();
        if (result.blocksCreated === 0) {
          setError(
            "No blocks were generated. Add queued content and active learning slots first."
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate schedule"
        );
      } finally {
        setTimeout(() => setFillAnimationOn(false), 1200);
      }
    });
  };

  const handleSendInvites = () => {
    setError(null);
    setSendState("sending");
    setSendMessage(null);

    startSendingTransition(async () => {
      try {
        const result = await sendScheduleDigest(currentWeekStart);
        if (!result.sent && result.reason === "NO_BLOCKS") {
          setSendState("empty");
          setSendMessage("No upcoming blocks for this week.");
          return;
        }

        setSendState("sent");
        setSendMessage("Invites sent for this week.");
      } catch (err) {
        setSendState("error");
        setSendMessage(
          err instanceof Error ? err.message : "Failed to send invites"
        );
      }
    });
  };

  const handleComplete = (blockId: string) => {
    startTransition(async () => {
      try {
        await completeBlock(blockId);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to complete block"
        );
      }
    });
  };

  const handleSkip = (blockId: string) => {
    startTransition(async () => {
      try {
        await skipBlock(blockId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to skip block");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#202327] p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="rounded-xl border border-white/15 px-3 py-2 text-sm text-zinc-300"
          >
            Prev
          </button>
          <span className="min-w-44 text-center text-sm font-medium text-white">
            {getWeekLabel(currentWeekStart)}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="rounded-xl border border-white/15 px-3 py-2 text-sm text-zinc-300"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendInvites}
            disabled={isSending}
            className="rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSending || sendState === "sending"
              ? "Sending..."
              : "Email This Week"}
          </button>

          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="rounded-2xl bg-white px-6 py-2.5 text-sm font-semibold text-[#1F5C56] disabled:opacity-60"
          >
            {isPending ? "Generating..." : "Generate Schedule"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {sendMessage && (
        <div
          className={`rounded-xl p-3 text-sm ${
            sendState === "error"
              ? "border border-red-400/20 bg-red-500/10 text-red-200"
              : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          {sendMessage}
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-7">
        {weekDates.map((date) => {
          const dayKey = getDayOfWeek(date);
          const daySlots = learningSlots
            .filter((slot) => slot.day_of_week === dayKey && slot.is_active)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

          const dayBlocks = blocksByDate[date] || [];

          return (
            <section key={date} className="rounded-2xl border border-white/10 bg-[#202327] p-3">
              <header className="mb-3 border-b border-white/10 pb-2">
                <p className="text-sm font-semibold text-white">{DAY_LABELS[dayKey]}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </header>

              {daySlots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/30 px-3 py-6 text-center text-xs text-zinc-500">
                  No blocks
                </div>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot) => {
                    const block =
                      dayBlocks.find((b) => b.slot_id === slot.id) ||
                      dayBlocks.find(
                        (b) =>
                          b.start_time === slot.start_time &&
                          b.end_time === slot.end_time
                      );

                    return (
                      <div key={slot.id}>
                        {!block ? (
                          <div
                            className={`relative overflow-hidden rounded-xl border border-dashed border-white/45 px-3 py-3 ${
                              fillAnimationOn ? "animate-pulse" : ""
                            }`}
                          >
                            {fillAnimationOn && (
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}
                            <p className="relative text-xs text-zinc-300">
                              {slot.start_time} - {slot.end_time}
                            </p>
                            <p className="relative mt-1 text-sm text-zinc-400">{slot.label || "Learning block"}</p>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-zinc-200 bg-white p-3 text-[#111315]">
                            <p className="text-xs text-zinc-600">
                              {block.start_time} - {block.end_time}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-medium text-[#111315]">
                              {block.content?.title || "Scheduled content"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-600">
                              {block.content?.estimated_duration_minutes || 0} min
                            </p>

                            {block.status === "UPCOMING" && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => handleComplete(block.id)}
                                  className="rounded-lg bg-[#1F5C56] px-2 py-1 text-[11px] text-white"
                                >
                                  Done
                                </button>
                                <button
                                  onClick={() => handleSkip(block.id)}
                                  className="rounded-lg border border-zinc-300 px-2 py-1 text-[11px] text-zinc-700"
                                >
                                  Skip
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
