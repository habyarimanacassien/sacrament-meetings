'use server';

/**
 * Server Actions for creating, updating, and deleting meetings.
 *
 * Every export of a 'use server' file becomes a POST endpoint, so nothing
 * that arrives here is trusted: all form values are validated with Zod
 * before they reach the database. (Sign-in checks are added in Week 05.)
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { isSunday, isValidIsoDate } from './dates';
import { NO_HYMN, isSacramentMeeting } from './meeting-labels';
import * as db from './meetings-db';
import type { Hymn } from './types';

// ---------------------------------------------------------------------------
// Form state shared with the create and edit forms (useActionState)
// ---------------------------------------------------------------------------

/**
 * Field errors keyed by the field's path in the schema, for example
 * 'presiding', 'openingHymn.number', or 'speakers.0.name'.
 */
export type FieldErrors = Partial<Record<string, string[]>>;

export type State = {
  errors?: FieldErrors;
  message?: string | null;
};

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const MAX_TEXT = 255; // matches the VARCHAR(255) columns
const MAX_LINE = 500;
const MAX_ITEMS = 20;

const MEETING_TYPES = ['testimony', 'regular', 'stake', 'general'] as const;

const shortText = z
  .string()
  .trim()
  .max(MAX_TEXT, `Keep this under ${MAX_TEXT} characters.`);

/** One line of a list typed into a textarea (announcements, ward business). */
const listOfLines = (itemName: string) =>
  z
    .array(
      z.string().max(MAX_LINE, `Keep each ${itemName} under ${MAX_LINE} characters.`),
    )
    .max(MAX_ITEMS, `List at most ${MAX_ITEMS} ${itemName}s.`);

/**
 * A hymn is a number plus a title, both optional on their own, but if one
 * is filled in the other must be too. Whether the hymn is required at all
 * depends on the meeting type, which is checked further down.
 */
const HymnSchema = z
  .object({
    number: z
      .string()
      .trim()
      .regex(/^(?:[1-9]\d{0,3})?$/, 'Enter a hymn number from 1 to 9999.'),
    title: shortText,
  })
  .superRefine((hymn, ctx) => {
    if (hymn.number && !hymn.title) {
      ctx.addIssue({ code: 'custom', path: ['title'], message: 'Enter the hymn title.' });
    }
    if (hymn.title && !hymn.number) {
      ctx.addIssue({ code: 'custom', path: ['number'], message: 'Enter the hymn number.' });
    }
  });

const SpeakerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a name, or remove this row.')
    .max(MAX_TEXT, `Keep the name under ${MAX_TEXT} characters.`),
  topic: shortText,
  type: z.enum(['speaker', 'musical-number'], {
    error: 'Choose “Speaker” or “Musical number”.',
  }),
});

const MeetingFormSchema = z
  .object({
    date: z
      .string()
      .trim()
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({ code: 'custom', message: 'Choose the date of the meeting.' });
        } else if (!isValidIsoDate(value)) {
          ctx.addIssue({ code: 'custom', message: 'Enter a real date (YYYY-MM-DD).' });
        } else if (!isSunday(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Sacrament meetings are held on Sunday. Choose a Sunday.',
          });
        }
      }),
    meetingType: z.enum(MEETING_TYPES, { error: 'Choose a meeting type.' }),
    presiding: shortText,
    conducting: shortText,
    announcements: listOfLines('announcement'),
    openingHymn: HymnSchema,
    openingPrayer: shortText,
    wardBusiness: listOfLines('ward business item'),
    stakeBusiness: z.boolean(),
    sacramentHymn: HymnSchema,
    speakers: z
      .array(SpeakerSchema)
      .max(MAX_ITEMS, `List at most ${MAX_ITEMS} speakers and musical numbers.`),
    closingHymn: HymnSchema,
    closingPrayer: shortText,
  })
  // Rules that depend on the meeting type. General conference Sundays have
  // no ward meeting, so only the date and announcements matter for them.
  .superRefine((data, ctx) => {
    if (data.meetingType === 'general') return;

    type PersonField = 'presiding' | 'conducting' | 'openingPrayer' | 'closingPrayer';
    type HymnField = 'openingHymn' | 'sacramentHymn' | 'closingHymn';

    const requireText = (field: PersonField, message: string) => {
      if (!data[field]) ctx.addIssue({ code: 'custom', path: [field], message });
    };
    const requireHymn = (field: HymnField, label: string) => {
      const hymn = data[field];
      if (!hymn.number && !hymn.title) {
        ctx.addIssue({
          code: 'custom',
          path: [field, 'number'],
          message: `Enter the ${label} number and title.`,
        });
      }
    };

    requireText('presiding', 'Enter who is presiding.');
    requireText('conducting', 'Enter who is conducting.');
    requireHymn('openingHymn', 'opening hymn');
    requireText('openingPrayer', 'Enter who will give the opening prayer.');
    if (isSacramentMeeting(data.meetingType)) {
      requireHymn('sacramentHymn', 'sacrament hymn');
    }
    requireHymn('closingHymn', 'closing hymn');
    requireText('closingPrayer', 'Enter who will give the closing prayer.');
  });

type MeetingFormData = z.infer<typeof MeetingFormSchema>;

// ---------------------------------------------------------------------------
// Helpers: FormData in, validated MeetingInput out
// ---------------------------------------------------------------------------

/** FormData.get() can return null or a File; treat both as empty text. */
function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

/** A textarea with one item per line, blank lines ignored. */
function readLines(formData: FormData, name: string): string[] {
  return readText(formData, name)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function readHymn(formData: FormData, prefix: string) {
  return {
    number: readText(formData, `${prefix}Number`),
    title: readText(formData, `${prefix}Title`),
  };
}

/**
 * Speaker rows submit three same-named fields each, so getAll() returns
 * them in row order: speakerName[0] goes with speakerTopic[0], and so on.
 */
function readSpeakers(formData: FormData) {
  const asText = (value: FormDataEntryValue | undefined) =>
    typeof value === 'string' ? value : '';
  const names = formData.getAll('speakerName');
  const topics = formData.getAll('speakerTopic');
  const types = formData.getAll('speakerType');

  return names.map((name, i) => ({
    name: asText(name),
    topic: asText(topics[i]),
    type: asText(types[i]),
  }));
}

/** Collects raw form values into the shape MeetingFormSchema expects. */
function readMeetingForm(formData: FormData) {
  return {
    date: readText(formData, 'date'),
    meetingType: readText(formData, 'meetingType'),
    presiding: readText(formData, 'presiding'),
    conducting: readText(formData, 'conducting'),
    announcements: readLines(formData, 'announcements'),
    openingHymn: readHymn(formData, 'openingHymn'),
    openingPrayer: readText(formData, 'openingPrayer'),
    wardBusiness: readLines(formData, 'wardBusiness'),
    stakeBusiness: formData.get('stakeBusiness') === 'on',
    sacramentHymn: readHymn(formData, 'sacramentHymn'),
    speakers: readSpeakers(formData),
    closingHymn: readHymn(formData, 'closingHymn'),
    closingPrayer: readText(formData, 'closingPrayer'),
  };
}

/**
 * Turns Zod issues into { 'openingHymn.number': ['...'] }. A trailing list
 * index is dropped so an error on announcements line 3 shows under the
 * announcements textarea, while speakers keep their row ('speakers.1.name').
 */
function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const path = [...issue.path];
    if (path.length > 1 && typeof path[path.length - 1] === 'number') path.pop();
    const key = path.join('.') || 'form';
    (errors[key] ??= []).push(issue.message);
  }
  return errors;
}

function toHymn(hymn: { number: string; title: string }): Hymn {
  return hymn.number ? { number: Number(hymn.number), title: hymn.title } : NO_HYMN;
}

/**
 * Builds the record to save. Parts of the program that don't apply to the
 * meeting type are cleared, so a meeting changed from "regular" to
 * "general" doesn't keep hidden speakers or hymns.
 */
function toMeetingInput(data: MeetingFormData): db.MeetingInput {
  const general = data.meetingType === 'general';
  const sacrament = isSacramentMeeting(data.meetingType);

  return {
    date: data.date,
    meetingType: data.meetingType,
    presiding: general ? '' : data.presiding,
    conducting: general ? '' : data.conducting,
    announcements: data.announcements,
    openingHymn: general ? NO_HYMN : toHymn(data.openingHymn),
    openingPrayer: general ? '' : data.openingPrayer,
    wardBusiness: sacrament
      ? data.wardBusiness.map((description) => ({ description }))
      : [],
    stakeBusiness: general ? false : data.stakeBusiness,
    sacramentHymn: sacrament ? toHymn(data.sacramentHymn) : NO_HYMN,
    speakers: general ? [] : data.speakers,
    closingHymn: general ? NO_HYMN : toHymn(data.closingHymn),
    closingPrayer: general ? '' : data.closingPrayer,
  };
}

const INVALID_FORM_MESSAGE =
  'Some fields need your attention. Fix the errors below and save again.';

const DUPLICATE_DATE_STATE: State = {
  errors: { date: ['A meeting is already planned for this Sunday. Choose another date or edit that meeting.'] },
  message: INVALID_FORM_MESSAGE,
};

/** Bound ids and hidden inputs come from the browser, so check them too. */
const MeetingIdSchema = z.coerce
  .number()
  .int()
  .refine(db.isValidMeetingId, 'Invalid meeting id.');

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/** Used by the create form: useActionState(createMeeting, initialState). */
export async function createMeeting(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validatedFields = MeetingFormSchema.safeParse(readMeetingForm(formData));

  if (!validatedFields.success) {
    return { errors: toFieldErrors(validatedFields.error), message: INVALID_FORM_MESSAGE };
  }

  try {
    await db.addMeeting(toMeetingInput(validatedFields.data));
  } catch (error) {
    // Expected problem the user can fix: show it next to the date field.
    if (db.isDuplicateDateError(error)) return DUPLICATE_DATE_STATE;

    // Anything else is unexpected: log the details on the server and let
    // app/(admin)/meetings/error.tsx show a friendly message.
    console.error('Database error creating meeting:', error);
    throw new Error('Failed to create the meeting. Please try again later.');
  }

  // redirect() works by throwing, so it must stay outside the try/catch.
  revalidatePath('/meetings');
  redirect('/meetings');
}

/**
 * Used by the edit form. The id comes first so the form can bind it:
 * updateMeeting.bind(null, id) leaves (prevState, formData) for React.
 */
export async function updateMeeting(
  id: number,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const parsedId = MeetingIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { message: 'This meeting could not be found. It may have been deleted.' };
  }

  const validatedFields = MeetingFormSchema.safeParse(readMeetingForm(formData));

  if (!validatedFields.success) {
    return { errors: toFieldErrors(validatedFields.error), message: INVALID_FORM_MESSAGE };
  }

  let updated;
  try {
    updated = await db.updateMeeting(parsedId.data, toMeetingInput(validatedFields.data));
  } catch (error) {
    if (db.isDuplicateDateError(error)) return DUPLICATE_DATE_STATE;

    console.error(`Database error updating meeting ${parsedId.data}:`, error);
    throw new Error('Failed to update the meeting. Please try again later.');
  }

  if (!updated) {
    return { message: 'This meeting could not be found. It may have been deleted.' };
  }

  revalidatePath('/meetings');
  revalidatePath(`/meetings/${parsedId.data}`);
  redirect('/meetings');
}

/**
 * Used by the small delete form on each meeting card. The meeting id is
 * sent in a hidden <input name="id">, so exactly one record is removed.
 * No redirect: the form lives on the /meetings list, so revalidatePath
 * refreshes that list in place and keeps the user's search and page.
 */
export async function deleteMeeting(formData: FormData): Promise<void> {
  const parsedId = MeetingIdSchema.safeParse(formData.get('id'));
  if (!parsedId.success) {
    throw new Error('Could not delete the meeting: the meeting id is invalid.');
  }

  try {
    // false means it was already gone; the list below refreshes either way.
    await db.deleteMeeting(parsedId.data);
  } catch (error) {
    console.error(`Database error deleting meeting ${parsedId.data}:`, error);
    throw new Error('Failed to delete the meeting. Please try again later.');
  }

  revalidatePath('/meetings');
  revalidatePath(`/meetings/${parsedId.data}`);
}
