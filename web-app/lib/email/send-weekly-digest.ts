import type { SupabaseClient } from "@supabase/supabase-js";
import { getResendClient } from "./resend-client";
import { generateICS } from "./ics-generator";
import { renderWeeklyDigest } from "./templates/weekly-digest";
import { formatDate } from "../scheduling/week-utils";
import type { User } from "../types/database";

/**
 * Orchestrates: fetch schedule → build ICS → render HTML → send via Resend.
 */
export async function sendWeeklyDigest(
  supabase: SupabaseClient,
  userId: string,
  weekStartDate: string
): Promise<{ sent: boolean }> {
  // Fetch user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) throw new Error("User not found");
  const typedUser = user as User;

  // Calculate week end
  const startDate = new Date(weekStartDate + "T00:00:00");
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  // Fetch scheduled blocks with content and categories
  const { data: blocks } = await supabase
    .from("scheduled_blocks")
    .select(
      "*, content:saved_content(*, content_categories(category:categories(name)))"
    )
    .eq("user_id", userId)
    .gte("scheduled_date", weekStartDate)
    .lte("scheduled_date", formatDate(endDate))
    .eq("status", "UPCOMING")
    .order("scheduled_date")
    .order("start_time");

  if (!blocks?.length) {
    return { sent: false }; // No blocks = no email
  }

  // Build ICS events
  const icsEvents = blocks.map((block: Record<string, unknown>) => {
    const content = block.content as Record<string, unknown>;
    return {
      title: `Cached: ${content.title as string}`,
      description: content.url as string,
      url: content.url as string,
      date: block.scheduled_date as string,
      startTime: (block.start_time as string).slice(0, 5),
      endTime: (block.end_time as string).slice(0, 5),
    };
  });

  const icsContent = generateICS(icsEvents);

  // Build email HTML
  const digestBlocks = blocks.map((block: Record<string, unknown>) => {
    const content = block.content as Record<string, unknown>;
    const contentCategories = (content.content_categories as Array<{ category: { name: string } }>) || [];
    const categoryName =
      contentCategories[0]?.category?.name || "Uncategorized";

    return {
      title: content.title as string,
      url: content.url as string,
      date: block.scheduled_date as string,
      startTime: (block.start_time as string).slice(0, 5),
      endTime: (block.end_time as string).slice(0, 5),
      category: categoryName,
      format: content.content_format as string,
      durationMinutes: content.estimated_duration_minutes as number,
    };
  });

  const totalMinutes = digestBlocks.reduce(
    (sum: number, b: { durationMinutes: number }) => sum + b.durationMinutes,
    0
  );

  const html = renderWeeklyDigest({
    userName: typedUser.name || "there",
    weekStartDate,
    blocks: digestBlocks,
    totalMinutes,
  });

  // Send via Resend
  const resend = getResendClient();
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Cached <noreply@cached.app>",
    to: typedUser.email,
    subject: `Your Learning Plan — Week of ${weekStartDate}`,
    html,
    attachments: [
      {
        filename: "learning-schedule.ics",
        content: Buffer.from(icsContent).toString("base64"),
      },
    ],
  });

  return { sent: true };
}
