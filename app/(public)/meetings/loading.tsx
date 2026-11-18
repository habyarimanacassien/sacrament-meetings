import MeetingsSkeleton from '@/components/MeetingsSkeleton';

/**
 * Scoped by the (public) route group: shown only while member-facing
 * meetings pages load, never for the (admin) pages or the home page.
 */
export default function MeetingsLoading() {
  return <MeetingsSkeleton />;
}
