import { redirect } from 'next/navigation';
import { fetchMeetings } from '@/lib/api';
import { getMostRecentSunday, toIsoDate } from '@/lib/dates';

/** Sends the visitor to the meeting for the most recent Sunday. */
export default async function CurrentMeetingPage() {
  // fetchMeetings() reads the request first, so `new Date()` below is
  // evaluated per request and never baked in at build time.
  const allMeetings = await fetchMeetings();
  const sunday = toIsoDate(getMostRecentSunday(new Date()));
  const current = allMeetings.find((meeting) => meeting.date === sunday);

  // Fallback: nothing planned for this Sunday, so show the full list.
  redirect(current ? `/meetings/${current.id}` : '/meetings');
}
