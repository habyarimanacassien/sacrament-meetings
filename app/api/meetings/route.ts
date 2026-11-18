import { getAllMeetings, getMeetingByDate } from '@/lib/meetings-db';
import type { ApiError, SacramentMeeting } from '@/lib/types';

/** True for a real calendar date like '2026-03-01' (rejects '2026-02-31'). */
function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

// GET /api/meetings
// GET /api/meetings?date=2026-03-01
export async function GET(request: Request): Promise<Response> {
  const date = new URL(request.url).searchParams.get('date');

  if (date === null) {
    const meetings: SacramentMeeting[] = await getAllMeetings();
    return Response.json(meetings);
  }

  // Check the format here so a bad value returns 400 instead of a database error.
  if (!isValidIsoDate(date)) {
    const body: ApiError = { error: 'Date must be a valid YYYY-MM-DD date.' };
    return Response.json(body, { status: 400 });
  }

  // Always an array, so the response shape matches the unfiltered list.
  const meeting = await getMeetingByDate(date);
  const meetings: SacramentMeeting[] = meeting ? [meeting] : [];
  return Response.json(meetings);
}
