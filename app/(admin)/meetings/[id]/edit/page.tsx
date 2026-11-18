import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Edit Meeting',
};

export default async function EditMeetingPage({
  params,
}: PageProps<'/meetings/[id]/edit'>) {
  const { id } = await params;

  return (
    <section className="rounded-lg border border-line bg-card p-6 shadow-sm sm:p-8">
      <h1 className="text-3xl font-semibold text-brand-dark">
        Edit Meeting — Coming in Week 04
      </h1>
      <p className="mt-2 text-muted">
        The form to change this meeting&apos;s agenda will be built next week.{' '}
        <Link
          href={`/meetings/${encodeURIComponent(id)}`}
          className="font-semibold text-brand-dark underline"
        >
          View the current agenda
        </Link>
      </p>
    </section>
  );
}
