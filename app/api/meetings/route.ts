import { isValidIsoDate } from '@/lib/dates';
import { getAllMeetings, getMeetingByDate } from '@/lib/meetings-db';
import type { ApiError, SacramentMeeting } from '@/lib/types';

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
