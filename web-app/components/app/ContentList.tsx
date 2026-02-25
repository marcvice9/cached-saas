"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SavedContent, ContentStatus, AISummary } from "@/lib/types/database";
import { updateContentStatus, deleteContent } from "@/lib/actions/content";

const STATUS_TABS: { label: string; value: ContentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Queued", value: "QUEUED" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Consumed", value: "CONSUMED" },
  { label: "Archived", value: "ARCHIVED" },
];

const FORMAT_LABELS: Record<string, string> = {
  VIDEO: "Video",
  AUDIO: "Audio",
  LONG_READ: "Long Read",
  SHORT_READ: "Short Read",
  CODE_REPO: "Code",
};

const PLATFORM_LABELS: Record<string, string> = {
  YOUTUBE: "YouTube",
  TWITTER: "Twitter",
  LINKEDIN: "LinkedIn",
  SPOTIFY: "Spotify",
  PODCAST: "Podcast",
  GITHUB: "GitHub",
  NEWSLETTER: "Newsletter",
  ARTICLE: "Article",
  OTHER: "Link",
};

function isExtracting(
  content: SavedContent & { ai_summary?: AISummary | null }
): boolean {
  const createdAt = new Date(content.created_at).getTime();
  const ageMs = Date.now() - createdAt;
  return ageMs < 1000 * 60 * 3 && !content.ai_summary;
}

export default function ContentList({
  initialContent,
}: {
  initialContent: Array<
    SavedContent & { categories?: { id: string; name: string }[]; ai_summary?: AISummary | null }
  >;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<ContentStatus | "ALL">("ALL");

  const filteredContent =
    filter === "ALL"
      ? initialContent
      : initialContent.filter((c) => c.status === filter);

  const handleStatusUpdate = (contentId: string, status: ContentStatus, hasSummary?: boolean) => {
    startTransition(async () => {
      await updateContentStatus(contentId, status);
      if (status === "CONSUMED" && !hasSummary) {
        fetch("/api/ai/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId }),
        }).catch(() => {});
      }
      router.refresh();
    });
  };

  const handleDelete = (contentId: string) => {
    if (!confirm("Delete this content?")) return;
    startTransition(async () => {
      await deleteContent(contentId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-1.5">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === "ALL"
              ? initialContent.length
              : initialContent.filter((c) => c.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`rounded-t-xl border border-b-0 px-4 py-2 text-sm font-semibold transition ${
                filter === tab.value
                  ? "border-[#06D6A0] bg-[#06D6A0] text-[#0E2E29]"
                  : "border-white/10 bg-[#2B2E33] text-zinc-300 hover:bg-[#353A42]"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#202327] p-4">
        {filteredContent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-[#1A1C1E] p-12 text-center text-zinc-400">
            {filter === "ALL"
              ? "No links saved yet. Add one above."
              : `No ${filter.toLowerCase()} content.`}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContent.map((content) => {
              const extracting = isExtracting(content);

              return (
                <article
                  key={content.id}
                  className={`rounded-2xl border border-white/10 bg-[#2A2E33] p-4 text-zinc-100 ${
                    isPending ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {content.thumbnail_url ? (
                      <img
                        src={content.thumbnail_url}
                        alt=""
                        className="h-20 w-32 flex-shrink-0 rounded-xl border border-white/20 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-zinc-300">
                        {PLATFORM_LABELS[content.source_platform]?.[0] || "L"}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm font-semibold text-white"
                        >
                          {content.title}
                        </a>
                        <span className="rounded-full bg-[#A78BFA]/20 px-2.5 py-1 text-[11px] font-medium text-[#E4DDFF]">
                          {content.status}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        <span>{PLATFORM_LABELS[content.source_platform] || content.source_platform}</span>
                        <span>•</span>
                        <span>{FORMAT_LABELS[content.content_format] || content.content_format}</span>
                        <span>•</span>
                        <span>{content.estimated_duration_minutes} min</span>
                      </div>

                      {content.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{content.description}</p>
                      )}

                      {extracting ? (
                        <div className="relative mt-3 overflow-hidden rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          <p className="relative text-xs text-[#7BEED4]">Extracting metadata and summary...</p>
                        </div>
                      ) : content.ai_summary ? (
                        <div className="mt-3 rounded-xl border border-[#06D6A0]/35 bg-[#06D6A0]/10 px-3 py-2">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded-full bg-[#06D6A0]/30 px-2 py-0.5 text-[11px] font-semibold text-[#A9F7E5]">AI Generated ✦</span>
                            <p className="text-xs font-semibold text-[#7BEED4]">Summary</p>
                          </div>
                          <p className="line-clamp-3 text-xs text-zinc-200">{content.ai_summary.summary_text}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                    {content.status === "QUEUED" && (
                      <button
                        onClick={() => handleStatusUpdate(content.id, "CONSUMED", !!content.ai_summary)}
                        className="rounded-xl bg-[#1F5C56] px-3 py-1.5 text-xs font-medium text-white"
                      >
                        Mark Done
                      </button>
                    )}
                    {(content.status === "QUEUED" || content.status === "SCHEDULED") && (
                      <button
                        onClick={() => handleStatusUpdate(content.id, "ARCHIVED")}
                        className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-zinc-200"
                      >
                        Archive
                      </button>
                    )}
                    {content.status === "ARCHIVED" && (
                      <button
                        onClick={() => handleStatusUpdate(content.id, "QUEUED")}
                        className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-zinc-200"
                      >
                        Re-queue
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="rounded-xl px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
