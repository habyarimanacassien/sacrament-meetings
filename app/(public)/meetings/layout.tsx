import { Suspense } from 'react';
import NavLinks, { type NavItem } from '@/components/NavLinks';

const meetingsNav: NavItem[] = [
  { href: '/meetings', label: 'All meetings', exact: true },
  { href: '/meetings/current', label: "This Sunday's program" },
];

export default function MeetingsLayout({
  children,
}: LayoutProps<'/meetings'>) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-line pb-3 print:hidden">
        <Suspense fallback={null}>
          <NavLinks items={meetingsNav} label="Meetings" variant="tabs" />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
