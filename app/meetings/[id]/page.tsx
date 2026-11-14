import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MeetingDetail from '@/components/MeetingDetail';
import PrintButton from '@/components/PrintButton';
import { fetchMeetingById } from '@/lib/api';
import { formatLongDate } from '@/lib/dates';

export async function generateMetadata({
  params,
}: PageProps<'/meetings/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const meeting = await fetchMeetingById(id);
  return { title: meeting ? formatLongDate(meeting.date) : 'Meeting not found' };
}

export default async function MeetingPage({
  params,
}: PageProps<'/meetings/[id]'>) {
  const { id } = await params;
  const meeting = await fetchMeetingById(id);

  if (!meeting) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/meetings"
          className="text-sm font-semibold text-brand-dark hover:underline"
        >
          ← Back to all meetings
        </Link>
        <PrintButton />
      </div>
      <MeetingDetail meeting={meeting} />
    </div>
  );
}
