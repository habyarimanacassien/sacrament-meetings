'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Search box for the meetings list. The URL (?query=) is the source of truth:
 * typing updates the URL, and the server page filters from it.
 */
export default function MeetingSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const urlQuery = searchParams.get('query') ?? '';

  // Wait 300 ms after the last keystroke so we don't query on every key.
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // a new search always starts on page 1
    const trimmed = term.trim();
    if (trimmed) {
      params.set('query', trimmed);
    } else {
      params.delete('query');
    }
    // push (not replace) so the Back button returns to the previous search.
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  // The input is uncontrolled (defaultValue), so it won't follow the URL by
  // itself. When the URL changes from outside (Back/Forward), copy it in.
  // Skip while the user is typing so we never overwrite their keystrokes.
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement !== input) {
      input.value = urlQuery;
    }
  }, [urlQuery]);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="meeting-search" className="text-sm font-semibold">
        Search meetings
      </label>
      <input
        ref={inputRef}
        id="meeting-search"
        type="search"
        placeholder="Search by speaker, leader, or meeting type…"
        defaultValue={urlQuery}
        onChange={(event) => handleSearch(event.target.value)}
        aria-label="Search meetings"
        className="w-full rounded-md border border-line bg-card px-4 py-2 text-ink placeholder:text-muted focus:border-brand sm:max-w-md"
      />
    </div>
  );
}
