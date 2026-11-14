import Link from 'next/link';
import { formatLongDate } from '@/lib/dates';
import { isSacramentMeeting, meetingTypeLabels } from '@/lib/meeting-labels';
import type { SacramentMeeting } from '@/lib/types';

interface MeetingCardProps {
  meeting: SacramentMeeting;
  /** Marks the card for the current Sunday. */
  isCurrent?: boolean;
}

function summarize(meeting: SacramentMeeting): string {
  if (!isSacramentMeeting(meeting.meetingType)) {
    return 'No ward sacrament meeting this Sunday.';
  }
  if (meeting.meetingType === 'testimony') {
    return `Conducting: ${meeting.conducting}. Bearing of testimonies.`;
  }
  const speakerCount = meeting.speakers.filter((s) => s.type === 'speaker').length;
  const musicCount = meeting.speakers.length - speakerCount;
  const parts = [`${speakerCount} ${speakerCount === 1 ? 'speaker' : 'speakers'}`];
  if (musicCount > 0) {
    parts.push(`${musicCount} musical ${musicCount === 1 ? 'number' : 'numbers'}`);
  }
  return `Conducting: ${meeting.conducting}. ${parts.join(', ')}.`;
}

export default function MeetingCard({
  meeting,
  isCurrent = false,
}: MeetingCardProps) {
  return (
    <article className="relative flex h-full flex-col gap-2 rounded-lg border border-line bg-card p-5 shadow-sm transition-shadow focus-within:shadow-md hover:shadow-md">
      <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
        {meetingTypeLabels[meeting.meetingType]}
        {isCurrent && (
          <span className="rounded-full bg-brand px-2 py-0.5 normal-case tracking-normal text-white">
            This Sunday
          </span>
        )}
      </p>
      <h3 className="text-lg font-semibold">
        {/* The ::after overlay makes the whole card clickable. */}
        <Link
          href={`/meetings/${meeting.id}`}
          className="text-brand-dark after:absolute after:inset-0 after:rounded-lg hover:underline"
        >
          {formatLongDate(meeting.date)}
        </Link>
      </h3>
      <p className="text-sm text-muted">{summarize(meeting)}</p>
    </article>
  );
}
