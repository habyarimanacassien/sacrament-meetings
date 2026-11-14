import { getMeetingById } from '@/lib/meetings-db';
import type { ApiError, SacramentMeeting } from '@/lib/types';

// GET /api/meetings/1
export async function GET(
  _request: Request,
  context: RouteContext<'/api/meetings/[id]'>,
): Promise<Response> {
  const { id } = await context.params;

  // Only whole positive numbers are valid ids ("abc", "1.5", "-2" are not).
  if (!/^\d+$/.test(id)) {
    const body: ApiError = { error: 'Meeting id must be a number.' };
    return Response.json(body, { status: 400 });
  }

  const meeting: SacramentMeeting | null = getMeetingById(Number(id));

  if (!meeting) {
    const body: ApiError = { error: `Meeting ${id} was not found.` };
    return Response.json(body, { status: 404 });
  }

  return Response.json(meeting);
}
