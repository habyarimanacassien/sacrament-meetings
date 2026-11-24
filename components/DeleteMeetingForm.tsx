'use client';

import type { FormEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteMeeting } from '@/lib/actions';

interface DeleteMeetingFormProps {
  id: number;
  /** Human-readable date, e.g. "Sunday, May 3, 2026". */
  dateLabel: string;
}

/** Lives inside the form so it can read the form's pending state. */
function DeleteButton({ dateLabel }: { dateLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-red-700 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? 'Deleting…' : 'Delete'}
      {/* Gives each Delete button a unique accessible name. */}
      <span className="sr-only"> meeting on {dateLabel}</span>
    </button>
  );
}

/**
 * A tiny form that sends one meeting id to the deleteMeeting Server Action.
 * The user must confirm first, because a delete can't be undone.
 */
export default function DeleteMeetingForm({ id, dateLabel }: DeleteMeetingFormProps) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete the meeting on ${dateLabel}? This can't be undone.`)) {
      event.preventDefault(); // Cancelled: the action is not called.
    }
  }

  return (
    <form action={deleteMeeting} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton dateLabel={dateLabel} />
    </form>
  );
}
