'use client';

import { useActionState } from 'react';
import MeetingForm, { initialState } from '@/components/MeetingForm';
import { createMeeting } from '@/lib/actions';

export default function CreateMeetingForm() {
  const [state, formAction, isPending] = useActionState(createMeeting, initialState);

  return (
    <MeetingForm
      state={state}
      formAction={formAction}
      isPending={isPending}
      submitLabel="Create meeting"
      cancelHref="/meetings"
    />
  );
}
