import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import MeetingCard from '@/components/MeetingCard';
import MeetingSearch from '@/components/MeetingSearch';
import MeetingsSkeleton from '@/components/MeetingsSkeleton';
import Pagination from '@/components/Pagination';
import { getMeetings, getMeetingsTotalPages } from '@/lib/meetings-db';

export const metadata: Metadata = {
  title: 'Meetings',
};

type SearchParams = PageProps<'/meetings'>['searchParams'];

/** Reads ?page= safely: anything that isn't a whole number ≥ 1 becomes 1. */
function toPageNumber(value: string | string[] | undefined): number {
  const page = Math.floor(Number(value));
  return Number.isFinite(page) && page >= 1 ? page : 1;
}

/** The search results + pagination. Waits for the URL and the database. */
async function MeetingResults({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.query === 'string' ? params.query.trim() : '';
  const currentPage = toPageNumber(params.page);

  // The two queries don't depend on each other, so run them together.
  const [meetings, totalPages] = await Promise.all([
    getMeetings(query, currentPage),
    getMeetingsTotalPages(query),
  ]);

  if (meetings.length === 0) {
    let message = 'No meetings have been planned yet.';
    if (query && totalPages === 0) message = `No meetings match “${query}”.`;
    else if (totalPages > 0) message = 'There are no meetings on this page.';

    return (
      <p role="status" className="rounded-md bg-brand-soft p-4 text-brand-dark">
        {message}{' '}
        {(query || currentPage > 1) && (
          <Link href="/meetings" className="font-semibold underline">
            Show all meetings
          </Link>
        )}
      </p>
    );
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meetings.map((meeting) => (
          <li key={meeting.id}>
            <MeetingCard meeting={meeting} />
          </li>
        ))}
      </ul>
      <Pagination totalPages={totalPages} />
    </>
  );
}

/**
 * The heading and search box render right away; only the results wait for
 * the database. That keeps the search input mounted (and focused) while new
 * results load after each keystroke.
 */
export default function MeetingsPage({ searchParams }: PageProps<'/meetings'>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-brand-dark">Meetings</h1>
          <p className="mt-1 text-muted">
            Search by speaker, presiding or conducting leader, or meeting type.
            Choose a Sunday to see the full agenda or print the program.
          </p>
        </div>
        <Link
          href="/meetings/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + New meeting
        </Link>
      </div>

      {/* useSearchParams() in MeetingSearch needs a Suspense boundary. */}
      <Suspense fallback={<div className="h-[4.25rem]" />}>
        <MeetingSearch />
      </Suspense>

      <Suspense fallback={<MeetingsSkeleton />}>
        <MeetingResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
