import type { Metadata } from 'next';
import MeetingCard from '@/components/MeetingCard';
import { fetchMeetings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Meetings',
};

export default async function MeetingsPage() {
  const meetings = await fetchMeetings();

  // Newest first. ISO dates sort correctly as plain strings.
  const newestFirst = [...meetings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-brand-dark">Meetings</h1>
        <p className="mt-1 text-muted">
          Choose a Sunday to see the full agenda or print the program.
        </p>
      </div>

      {newestFirst.length === 0 ? (
        <p>No meetings have been planned yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newestFirst.map((meeting) => (
            <li key={meeting.id}>
              <MeetingCard meeting={meeting} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
