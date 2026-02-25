"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { completeBlock, skipBlock } from "@/lib/actions/schedule";
import type { ScheduledBlock, SavedContent } from "@/lib/types/database";

type BlockWithContent = ScheduledBlock & {
  content: SavedContent | null;
};

export default function TodayPlan({
  blocks,
}: {
  blocks: BlockWithContent[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleBlocks = blocks.filter(
    (b) => b.status === "UPCOMING" && !dismissed.has(b.id)
  );

  const handleStart = (block: BlockWithContent) => {
    if (block.content?.url) {
      window.open(block.content.url, "_blank");
    }
    startTransition(async () => {
      await completeBlock(block.id);
      setDismissed((prev) => new Set(prev).add(block.id));
      router.refresh();
    });
  };

  const handleSkip = (blockId: string) => {
    startTransition(async () => {
      await skipBlock(blockId);
      setDismissed((prev) => new Set(prev).add(blockId));
      router.refresh();
    });
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#202327] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Today&apos;s Plan</h2>
          <p className="mt-1 text-sm text-zinc-400">Index cards for your current lesson queue.</p>
        </div>
        <Link href="/app/schedule" className="text-sm text-zinc-300 hover:text-white">
          Weekly planner
        </Link>
      </div>

      {visibleBlocks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/30 bg-[#1A1C1E] py-8 text-center text-sm text-zinc-400">
          No cards for today.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleBlocks.map((block) => (
            <article
              key={block.id}
              className={`rounded-2xl border border-zinc-200 bg-[#F7F6F2] p-4 text-[#111315] transition ${
                isPending ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-[#06D6A0]/20 px-2.5 py-1 text-[11px] font-semibold text-[#155A51]">
                  {block.content?.content_format?.replace("_", " ") || "Lesson"}
                </span>
                <span className="text-xs text-zinc-600">{block.start_time} - {block.end_time}</span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm font-semibold text-[#111315]">
                {block.content?.title || "Untitled content"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {block.content?.estimated_duration_minutes || 0} min
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleStart(block)}
                  disabled={isPending}
                  className="rounded-xl bg-[#1F5C56] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Start
                </button>
                <button
                  onClick={() => handleSkip(block.id)}
                  disabled={isPending}
                  className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
