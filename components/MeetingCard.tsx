import Link from 'next/link';
import { formatLongDate } from '@/lib/dates';
import { isSacramentMeeting, meetingTypeLabels } from '@/lib/meeting-labels';
import type { SacramentMeeting } from '@/lib/types';

interface MeetingCardProps {
  meeting: SacramentMeeting;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <article className="relative flex h-full flex-col gap-2 rounded-lg border border-line bg-card p-5 shadow-sm transition-shadow focus-within:shadow-md hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        {meetingTypeLabels[meeting.meetingType]}
      </p>
      <h2 className="text-lg font-semibold">
        {/* The ::after overlay makes the whole card clickable. */}
        <Link
          href={`/meetings/${meeting.id}`}
          className="text-brand-dark after:absolute after:inset-0 after:rounded-lg hover:underline"
        >
          {formatLongDate(meeting.date)}
        </Link>
      </h2>
      <p className="text-sm text-muted">
        {isSacramentMeeting(meeting.meetingType)
          ? `Conducting: ${meeting.conducting}`
          : 'No ward sacrament meeting this Sunday.'}
      </p>
    </article>
  );
}
