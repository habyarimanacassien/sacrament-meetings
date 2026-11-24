'use client';

import { useActionState } from 'react';
import MeetingForm, { initialState } from '@/components/MeetingForm';
import { updateMeeting } from '@/lib/actions';
import type { SacramentMeeting } from '@/lib/types';

export default function EditMeetingForm({ meeting }: { meeting: SacramentMeeting }) {
  // Pre-fill the id, so React calls updateMeeting(meeting.id, prevState, formData).
  const updateMeetingWithId = updateMeeting.bind(null, meeting.id);
  const [state, formAction, isPending] = useActionState(updateMeetingWithId, initialState);

  return (
    <MeetingForm
      state={state}
      formAction={formAction}
      isPending={isPending}
      meeting={meeting}
      submitLabel="Save changes"
      cancelHref={`/meetings/${meeting.id}`}
    />
  );
}
