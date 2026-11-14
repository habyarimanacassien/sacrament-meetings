'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
  /** When true, the link is only active on an exact path match. */
  exact?: boolean;
}

interface NavLinksProps {
  items: NavItem[];
  /** Accessible name for the <nav> landmark, e.g. "Main". */
  label: string;
  variant?: 'header' | 'tabs';
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function NavLinks({
  items,
  label,
  variant = 'header',
}: NavLinksProps) {
  const pathname = usePathname();

  const base = 'rounded-md px-3 py-2 text-sm font-medium transition-colors';
  const styles =
    variant === 'header'
      ? { active: 'bg-white text-brand-dark', idle: 'text-white hover:bg-white/15' }
      : { active: 'bg-brand text-white', idle: 'text-brand-dark hover:bg-brand-soft' };

  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`${base} ${active ? styles.active : styles.idle}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
