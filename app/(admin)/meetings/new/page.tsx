import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Meeting',
};

export default function NewMeetingPage() {
  return (
    <section className="rounded-lg border border-line bg-card p-6 shadow-sm sm:p-8">
      <h1 className="text-3xl font-semibold text-brand-dark">
        Create Meeting — Coming in Week 04
      </h1>
      <p className="mt-2 text-muted">
        This is where the bishopric will plan a new sacrament meeting: hymns,
        prayers, ward business, and speakers.
      </p>
    </section>
  );
}
