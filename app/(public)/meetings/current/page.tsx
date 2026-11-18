import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getMostRecentSunday, toIsoDate } from '@/lib/dates';
import { getMeetingByDate } from '@/lib/meetings-db';

/** Sends the visitor to the meeting for the most recent Sunday. */
export default async function CurrentMeetingPage() {
  // Wait for the request so `new Date()` is evaluated per visit,
  // never baked in at build time.
  await connection();
  const sunday = toIsoDate(getMostRecentSunday(new Date()));
  const current = await getMeetingByDate(sunday);

  // Fallback: nothing planned for this Sunday, so show the full list.
  redirect(current ? `/meetings/${current.id}` : '/meetings');
}
