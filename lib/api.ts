import { headers } from 'next/headers';
import type { SacramentMeeting } from './types';

/**
 * Server Components need an absolute URL to call the app's own API routes.
 * The host comes from the incoming request, so the same code works on
 * localhost, Vercel preview deployments, and production.
 */
async function getBaseUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    'localhost:3000';
  const protocol =
    requestHeaders.get('x-forwarded-proto')?.split(',')[0] ?? 'http';
  return `${protocol}://${host}`;
}

/** GET /api/meetings (optionally filtered with ?date=YYYY-MM-DD). */
export async function fetchMeetings(date?: string): Promise<SacramentMeeting[]> {
  const baseUrl = await getBaseUrl();
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const response = await fetch(`${baseUrl}/api/meetings${query}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Could not load meetings (status ${response.status}).`);
  }

  const meetings: SacramentMeeting[] = await response.json();
  return meetings;
}

/** GET /api/meetings/[id]. Returns null when the meeting does not exist. */
export async function fetchMeetingById(
  id: string,
): Promise<SacramentMeeting | null> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/meetings/${encodeURIComponent(id)}`,
    { cache: 'no-store' },
  );

  // 400 = id is not a number, 404 = no such meeting. Both mean "not found".
  if (response.status === 400 || response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Could not load the meeting (status ${response.status}).`);
  }

  const meeting: SacramentMeeting = await response.json();
  return meeting;
}
