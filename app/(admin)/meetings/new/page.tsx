import type { Metadata } from 'next';
import CreateMeetingForm from './create-meeting-form';

export const metadata: Metadata = {
  title: 'Create Meeting',
};

export default function NewMeetingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-brand-dark">Create meeting</h1>
        <p className="mt-1 text-muted">
          Plan a new Sunday: hymns, prayers, ward business, and speakers.
        </p>
      </div>
      <CreateMeetingForm />
    </div>
  );
}
