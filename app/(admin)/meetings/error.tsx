'use client'; // Error boundaries must be Client Components.

import MeetingsErrorView from '@/components/MeetingsErrorView';

/**
 * Catches unexpected errors thrown while rendering these meetings routes,
 * including errors re-thrown by the Server Actions in lib/actions.ts.
 *
 * Next.js 16.3+ passes `retry` (re-fetches the data and re-renders) in
 * addition to `reset` (re-renders only). `retry` is the one to use when the
 * cause was a failed database call, so "Try again" really tries again.
 */
export default function MeetingsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <MeetingsErrorView error={error} retry={retry} />;
}
