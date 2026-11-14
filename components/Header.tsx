import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import NavLinks, { type NavItem } from '@/components/NavLinks';
import { site } from '@/lib/site';

const mainNav: NavItem[] = [
  { href: '/', label: 'Home', exact: true },
  { href: '/meetings', label: 'Meetings' },
];

/**
 * Today's date changes on every request, so it waits for the request
 * (connection()) and streams in through <Suspense> while the rest of the
 * header stays static.
 */
async function CurrentDate() {
  await connection();
  const today = new Date();
  const label = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(today);

  return <time dateTime={today.toISOString().slice(0, 10)}>{label}</time>;
}

export default function Header() {
  return (
    <header className="bg-brand text-white print:hidden">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <div>
          <Link href="/" className="font-heading text-xl font-semibold">
            {site.wardName}
          </Link>
          <p className="text-sm text-white/90">
            <Suspense fallback={<span>&nbsp;</span>}>
              <CurrentDate />
            </Suspense>
          </p>
        </div>
        <Suspense fallback={null}>
          <NavLinks items={mainNav} label="Main" variant="header" />
        </Suspense>
      </div>
    </header>
  );
}
