import Link from 'next/link';
import DeleteMeetingForm from '@/components/DeleteMeetingForm';
import { formatLongDate } from '@/lib/dates';
import { isSacramentMeeting, meetingTypeLabels } from '@/lib/meeting-labels';
import type { SacramentMeeting } from '@/lib/types';

interface MeetingCardProps {
  meeting: SacramentMeeting;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const dateLabel = formatLongDate(meeting.date);

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
          {dateLabel}
        </Link>
      </h2>
      <p className="text-sm text-muted">
        {isSacramentMeeting(meeting.meetingType)
          ? `Conducting: ${meeting.conducting}`
          : 'No ward sacrament meeting this Sunday.'}
      </p>

      {/* relative z-10 lifts the actions above the card's link overlay. */}
      <div className="relative z-10 mt-auto flex items-center gap-2 border-t border-line pt-3">
        <Link
          href={`/meetings/${meeting.id}/edit`}
          className="rounded-md border border-line px-3 py-1 text-sm font-semibold text-brand-dark hover:bg-brand-soft"
        >
          Edit<span className="sr-only"> meeting on {dateLabel}</span>
        </Link>
        <DeleteMeetingForm id={meeting.id} dateLabel={dateLabel} />
      </div>
    </article>
  );
}
