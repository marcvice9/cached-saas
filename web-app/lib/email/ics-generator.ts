import * as ics from "ics";

interface CalendarEvent {
  title: string;
  description: string;
  url: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

/**
 * Generate an .ics calendar file from scheduled blocks.
 */
export function generateICS(events: CalendarEvent[]): string {
  const icsEvents: ics.EventAttributes[] = events.map((event) => {
    const [year, month, day] = event.date.split("-").map(Number);
    const [startHour, startMin] = event.startTime.split(":").map(Number);
    const [endHour, endMin] = event.endTime.split(":").map(Number);

    return {
      title: event.title,
      description: event.description,
      url: event.url,
      start: [year, month, day, startHour, startMin],
      end: [year, month, day, endHour, endMin],
      status: "CONFIRMED" as const,
      busyStatus: "BUSY" as const,
    };
  });

  const { error, value } = ics.createEvents(icsEvents);

  if (error) {
    throw new Error(`Failed to generate ICS: ${error.message}`);
  }

  return value!;
}
