import type { Metadata } from 'next';
import MeetingCard from '@/components/MeetingCard';
import { fetchMeetings } from '@/lib/api';
import { getMostRecentSunday, toIsoDate } from '@/lib/dates';
import type { SacramentMeeting } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Meetings',
};

interface MeetingGroupProps {
  id: string;
  title: string;
  meetings: SacramentMeeting[];
  currentDate: string;
}

function MeetingGroup({ id, title, meetings, currentDate }: MeetingGroupProps) {
  if (meetings.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meetings.map((meeting) => (
          <li key={meeting.id}>
            <MeetingCard
              meeting={meeting}
              isCurrent={meeting.date === currentDate}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function MeetingsPage() {
  const meetings = await fetchMeetings();
  const currentDate = toIsoDate(getMostRecentSunday(new Date()));

  // ISO dates sort correctly as plain strings.
  const newestFirst = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  const upcoming = newestFirst.filter((m) => m.date > currentDate).reverse();
  const currentAndPast = newestFirst.filter((m) => m.date <= currentDate);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-brand-dark">Meetings</h1>
        <p className="mt-1 text-muted">
          Choose a Sunday to see the full agenda or print the program.
        </p>
      </div>

      {meetings.length === 0 && <p>No meetings have been planned yet.</p>}

      <MeetingGroup
        id="current-past-heading"
        title="This week and past programs"
        meetings={currentAndPast}
        currentDate={currentDate}
      />
      <MeetingGroup
        id="upcoming-heading"
        title="Upcoming meetings"
        meetings={upcoming}
        currentDate={currentDate}
      />
    </div>
  );
}
