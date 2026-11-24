'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface MeetingsErrorViewProps {
  error: unknown;
  retry: () => void;
}

/** Server errors carry a `digest` that matches the entry in the server logs. */
function getDigest(error: unknown): string | undefined {
  if (error instanceof Error && 'digest' in error && typeof error.digest === 'string') {
    return error.digest;
  }
  return undefined;
}

/**
 * Friendly fallback for unexpected errors in the meetings routes.
 * Rendered by the error.tsx files in app/(public)/meetings and
 * app/(admin)/meetings. In production, Next.js hides the real message of
 * server errors, so this view always shows its own wording.
 */
export default function MeetingsErrorView({ error, retry }: MeetingsErrorViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const digest = getDigest(error);

  useEffect(() => {
    // Details for developers (browser console); the server log has the rest.
    console.error('An uncaught error occurred in the meetings pages:', error);
    // Move focus here so keyboard and screen-reader users know what happened.
    headingRef.current?.focus();
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto mt-8 max-w-xl rounded-lg border border-line bg-card p-6 text-center shadow-sm"
    >
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-brand-dark">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted">
        We couldn&apos;t complete that request. The meeting list may be
        temporarily unavailable. Please try again in a moment.
      </p>
      {digest && (
        <p className="mt-2 text-sm text-muted">
          Reference code: <code>{digest}</code>
        </p>
      )}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
        >
          Try again
        </button>
        <Link
          href="/meetings"
          className="rounded-md border border-line px-4 py-2 font-semibold text-brand-dark hover:bg-brand-soft"
        >
          Go back to meetings
        </Link>
      </div>
    </section>
  );
}
