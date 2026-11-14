import Link from 'next/link';

export default function MeetingNotFound() {
  return (
    <div className="rounded-lg border border-line bg-card p-6">
      <h1 className="text-2xl font-semibold">Meeting not found</h1>
      <p className="mt-2 text-muted">
        There is no meeting with that id. It may have been removed.
      </p>
      <Link
        href="/meetings"
        className="mt-4 inline-block font-semibold text-brand-dark hover:underline"
      >
        Back to all meetings
      </Link>
    </div>
  );
}
