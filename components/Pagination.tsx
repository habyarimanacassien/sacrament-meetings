'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  totalPages: number;
}

const linkStyle =
  'rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft';
const disabledStyle =
  'rounded-md border border-line px-4 py-2 text-sm font-semibold text-muted';

/** Previous / Next links that keep the current ?query= in the URL. */
export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Same rule as the page: anything that isn't a whole number ≥ 1 means page 1.
  const currentPage = Math.max(1, Math.floor(Number(searchParams.get('page'))) || 1);

  // One page (or no results) needs no controls.
  if (totalPages <= 1) return null;

  function createPageURL(page: number): string {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t border-line pt-4"
    >
      {currentPage > 1 ? (
        <Link href={createPageURL(currentPage - 1)} className={linkStyle}>
          ← Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledStyle}>
          ← Previous
        </span>
      )}

      <span className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link href={createPageURL(currentPage + 1)} className={linkStyle}>
          Next →
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledStyle}>
          Next →
        </span>
      )}
    </nav>
  );
}
