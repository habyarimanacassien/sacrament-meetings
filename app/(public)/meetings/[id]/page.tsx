import Link from 'next/link';
import { notFound } from 'next/navigation';
import MeetingDetail from '@/components/MeetingDetail';
import PrintButton from '@/components/PrintButton';
import { getMeetingById } from '@/lib/meetings-db';

export default async function MeetingPage({
  params,
}: PageProps<'/meetings/[id]'>) {
  const { id } = await params;

  // Only whole positive numbers are ids; "abc" or "1e2" go straight to 404.
  const meeting = /^\d+$/.test(id) ? await getMeetingById(Number(id)) : null;

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
