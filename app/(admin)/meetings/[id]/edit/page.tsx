import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { formatLongDate } from '@/lib/dates';
import { getMeetingById } from '@/lib/meetings-db';
import EditMeetingForm from './edit-meeting-form';

export const metadata: Metadata = {
  title: 'Edit Meeting',
};

type Params = PageProps<'/meetings/[id]/edit'>['params'];

/**
 * Reads the id from the URL and loads the meeting. This waits for the
 * database, so it lives inside the <Suspense> boundary below.
 */
async function EditMeetingContent({ params }: { params: Params }) {
  const { id } = await params;

  // Only whole positive numbers are ids; "abc" or "1e2" go straight to 404.
  const meeting = /^\d+$/.test(id) ? await getMeetingById(Number(id)) : null;

  // Renders the closest not-found.tsx (./not-found.tsx).
  if (!meeting) notFound();

  return (
    <>
      <p className="-mt-5 text-muted">
        <time dateTime={meeting.date}>{formatLongDate(meeting.date)}</time>
      </p>
      <EditMeetingForm meeting={meeting} />
    </>
  );
}

/** Shown while the meeting loads. */
function EditMeetingSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <p className="text-muted">Loading meeting…</p>
      <div aria-hidden="true" className="flex flex-col gap-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-36 animate-pulse rounded-lg border border-line bg-card"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The heading renders right away; only the form waits for the database.
 * With Cache Components, data read outside <Suspense> would block the
 * navigation (for example from /meetings/3/edit to /meetings/4/edit),
 * because the (admin) loading.tsx sits above the [id] segment that changes.
 */
export default function EditMeetingPage({ params }: PageProps<'/meetings/[id]/edit'>) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold text-brand-dark">Edit meeting</h1>
      <Suspense fallback={<EditMeetingSkeleton />}>
        <EditMeetingContent params={params} />
      </Suspense>
    </div>
  );
}
