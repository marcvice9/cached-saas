"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  LearningSlot,
  DayOfWeek,
  ContentFormat,
  Category,
} from "@/lib/types/database";
import { createSlot, updateSlot, deleteSlot } from "@/lib/actions/slots";

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const FORMATS: ContentFormat[] = [
  "VIDEO",
  "AUDIO",
  "LONG_READ",
  "SHORT_READ",
  "CODE_REPO",
];

const FORMAT_LABELS: Record<ContentFormat, string> = {
  VIDEO: "Video",
  AUDIO: "Audio",
  LONG_READ: "Long Read",
  SHORT_READ: "Short Read",
  CODE_REPO: "Code",
};

export default function SlotManager({
  initialSlots,
  categories,
}: {
  initialSlots: LearningSlot[];
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("MONDAY");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [label, setLabel] = useState("");
  const [allowedFormats, setAllowedFormats] = useState<ContentFormat[]>([]);
  const [preferredCategoryId, setPreferredCategoryId] = useState<string>("");

  const slotsByDay = DAYS.map((day) => ({
    day,
    label: DAY_LABELS[day],
    slots: initialSlots
      .filter((s) => s.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })).filter((group) => group.slots.length > 0);

  const resetForm = () => {
    setDayOfWeek("MONDAY");
    setStartTime("09:00");
    setEndTime("10:00");
    setLabel("");
    setAllowedFormats([]);
    setPreferredCategoryId("");
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const startEdit = (slot: LearningSlot) => {
    setDayOfWeek(slot.day_of_week);
    setStartTime(slot.start_time);
    setEndTime(slot.end_time);
    setLabel(slot.label || "");
    setAllowedFormats(slot.allowed_formats || []);
    setPreferredCategoryId(slot.preferred_category_id || "");
    setEditingId(slot.id);
    setShowForm(true);
  };

  const toggleFormat = (format: ContentFormat) => {
    setAllowedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (startTime >= endTime) {
      setError("Start time must be before end time");
      return;
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateSlot({
            id: editingId,
            dayOfWeek: dayOfWeek,
            startTime,
            endTime,
            label: label || null,
            allowedFormats: allowedFormats.length ? allowedFormats : null,
            preferredCategoryId: preferredCategoryId || null,
          });
        } else {
          await createSlot({
            dayOfWeek: dayOfWeek,
            startTime,
            endTime,
            label: label || undefined,
            allowedFormats: allowedFormats.length ? allowedFormats : undefined,
            preferredCategoryId: preferredCategoryId || undefined,
            isActive: true,
          });
        }
        resetForm();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save slot");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this learning slot?")) return;
    startTransition(async () => {
      try {
        await deleteSlot(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete slot");
      }
    });
  };

  const handleToggleActive = (slot: LearningSlot) => {
    startTransition(async () => {
      try {
        await updateSlot({ id: slot.id, isActive: !slot.is_active });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update slot");
      }
    });
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return null;
    return categories.find((c) => c.id === id)?.name;
  };

  return (
    <div>
      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="mb-4 rounded-xl bg-[#06D6A0] px-4 py-2 text-sm font-semibold text-[#0E2E29]"
        >
          + New Slot
        </button>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-white/10 bg-[#1E2226] p-5"
        >
          <h3 className="mb-4 font-semibold text-white">
            {editingId ? "Edit Slot" : "New Learning Slot"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-200">
                Day *
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full rounded-lg border border-white/10 bg-[#272C31] px-3 py-2 text-sm text-white outline-none focus:border-[#06D6A0]/45"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {DAY_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-200">
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Morning Reading"
                className="w-full rounded-lg border border-white/10 bg-[#272C31] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#06D6A0]/45"
                maxLength={100}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-200">
                Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#272C31] px-3 py-2 text-sm text-white outline-none focus:border-[#06D6A0]/45"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-200">
                End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#272C31] px-3 py-2 text-sm text-white outline-none focus:border-[#06D6A0]/45"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-200">
                Preferred Category
              </label>
              <select
                value={preferredCategoryId}
                onChange={(e) => setPreferredCategoryId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#272C31] px-3 py-2 text-sm text-white outline-none focus:border-[#06D6A0]/45"
              >
                <option value="">Any category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Allowed Formats
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => toggleFormat(format)}
                    className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                      allowedFormats.includes(format)
                        ? "bg-[#06D6A0] text-[#0E2E29]"
                        : "bg-white/10 text-zinc-300 hover:bg-white/15"
                    }`}
                  >
                    {FORMAT_LABELS[format]}
                  </button>
                ))}
                {allowedFormats.length === 0 && (
                  <span className="py-1 text-xs text-zinc-500">
                    All formats allowed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#06D6A0] px-4 py-2 text-sm font-semibold text-[#0E2E29] disabled:opacity-50"
            >
              {isPending
                ? "Saving..."
                : editingId
                  ? "Update"
                  : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {slotsByDay.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-[#1A1C1E] p-12 text-center">
          <p className="text-zinc-400">
            No learning slots configured. Create slots to define when you want to learn.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {slotsByDay.map((group) => (
            <div key={group.day}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`rounded-xl border border-white/10 bg-[#262A2F] p-4 transition-opacity ${
                      isPending ? "opacity-60" : ""
                    } ${!slot.is_active ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {slot.start_time} – {slot.end_time}
                          </span>
                          {slot.label && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                              {slot.label}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                          {slot.allowed_formats?.length ? (
                            <span>
                              {slot.allowed_formats
                                .map((f) => FORMAT_LABELS[f])
                                .join(", ")}
                            </span>
                          ) : (
                            <span>All formats</span>
                          )}
                          {getCategoryName(slot.preferred_category_id) && (
                            <>
                              <span>·</span>
                              <span>
                                {getCategoryName(slot.preferred_category_id)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(slot)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${
                            slot.is_active
                              ? "bg-[#06D6A0] text-[#0E2E29]"
                              : "bg-white/10 text-zinc-300"
                          }`}
                        >
                          {slot.is_active ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => startEdit(slot)}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
