import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  // Leader pages shouldn't show up in search engines.
  robots: { index: false, follow: false },
};

/**
 * Layout for leader-facing (admin) pages. The (admin) folder is a route
 * group, so it adds nothing to the URL: app/(admin)/meetings/new/page.tsx
 * is still /meetings/new. Sign-in protection is added in Week 05.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent/40 bg-card px-4 py-3">
        <p className="text-sm">
          <span className="font-semibold text-accent">Leader tools.</span>{' '}
          <span className="text-muted">Sign-in for bishopric members is coming in Week 05.</span>
        </p>
        <Link
          href="/meetings"
          className="text-sm font-semibold text-brand-dark hover:underline"
        >
          ← Back to all meetings
        </Link>
      </div>
      {children}
    </div>
  );
}
