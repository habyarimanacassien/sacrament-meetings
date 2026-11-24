import Link from 'next/link';
import { site } from '@/lib/site';

/** Shown by the not-found.tsx files when a meeting id doesn't exist. */
export default function MeetingNotFoundView() {
  return (
    <section className="mx-auto mt-8 max-w-xl rounded-lg border border-line bg-card p-6 text-center shadow-sm">
      {/* Nested not-found files can't export metadata; React hoists <title> into <head>. */}
      <title>{`Meeting Not Found | ${site.wardName}`}</title>
      <h1 className="text-2xl font-semibold text-brand-dark">Meeting not found</h1>
      <p className="mt-3 text-muted">
        We couldn&apos;t find that meeting. It may have been deleted, or the
        link may be wrong.
      </p>
      <div className="mt-6 flex justify-center">
        <Link
          href="/meetings"
          className="rounded-md border border-line px-4 py-2 font-semibold text-brand-dark hover:bg-brand-soft"
        >
          Back to meetings
        </Link>
      </div>
    </section>
  );
}
