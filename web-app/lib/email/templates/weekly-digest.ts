interface DigestBlock {
  title: string;
  url: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  format: string;
  durationMinutes: number;
}

interface DigestData {
  userName: string;
  weekStartDate: string;
  blocks: DigestBlock[];
  totalMinutes: number;
}

/**
 * Inline-styled HTML email template for the weekly learning digest.
 */
export function renderWeeklyDigest(data: DigestData): string {
  const blockRows = data.blocks
    .map(
      (block) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eee;">
        <div style="font-weight: 600; color: #0A0915; margin-bottom: 4px;">
          ${escapeHtml(block.title)}
        </div>
        <div style="font-size: 13px; color: #666;">
          ${block.date} &middot; ${block.startTime}–${block.endTime} &middot; ${block.durationMinutes}min &middot; ${block.category}
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #eee; text-align: right; vertical-align: middle;">
        <a href="${escapeHtml(block.url)}" style="display: inline-block; padding: 8px 16px; background: rgb(238, 86, 34); color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500;">
          Start
        </a>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #F7F6F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background: #0A0915; padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
          Your Weekly Learning Plan
        </h1>
        <p style="margin: 8px 0 0; color: #999; font-size: 14px;">
          Week of ${escapeHtml(data.weekStartDate)} &middot; ${data.totalMinutes} minutes scheduled
        </p>
      </div>

      <!-- Greeting -->
      <div style="padding: 24px;">
        <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
          Hi ${escapeHtml(data.userName)}, here's your learning schedule for the week. An .ics calendar file is attached — open it to add these blocks to your calendar.
        </p>
      </div>

      <!-- Schedule Table -->
      <table style="width: 100%; border-collapse: collapse;">
        ${blockRows}
      </table>

      <!-- Footer -->
      <div style="padding: 24px; text-align: center; border-top: 1px solid #eee;">
        <p style="margin: 0; color: #999; font-size: 12px;">
          Sent by Cached — Turn Saved Content Into Scheduled Learning
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
