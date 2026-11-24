'use client';

import Link from 'next/link';
import {
  startTransition,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { FieldErrors, State } from '@/lib/actions';
import { hasHymn, isSacramentMeeting, meetingTypeLabels } from '@/lib/meeting-labels';
import type { Hymn, MeetingType, SacramentMeeting, SpeakerItem } from '@/lib/types';

/** Must match the State shape returned by createMeeting / updateMeeting. */
export const initialState: State = { message: null, errors: {} };

interface MeetingFormProps {
  /** Latest result from useActionState. */
  state: State;
  /** The dispatch function from useActionState. */
  formAction: (formData: FormData) => void;
  isPending: boolean;
  /** The meeting being edited. Leave out for a new meeting. */
  meeting?: SacramentMeeting;
  submitLabel: string;
  cancelHref: string;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

/** 'speakers.0.name' → 'speakers-0-name' (used for id attributes). */
function toId(field: string): string {
  return field.replace(/\./g, '-');
}

function errorId(field: string): string {
  return `${toId(field)}-error`;
}

const inputClass =
  'block w-full rounded-md border border-line bg-white px-3 py-2 text-ink shadow-sm ' +
  'aria-invalid:border-red-700 disabled:bg-paper';

const labelClass = 'mb-1 block text-sm font-semibold text-ink';

/**
 * The live region under a field. It is always in the DOM (even when empty)
 * so screen readers announce messages as soon as they appear.
 */
function FieldErrorList({ field, errors }: { field: string; errors?: string[] }) {
  return (
    <div id={errorId(field)} aria-live="polite" aria-atomic="true">
      {errors?.map((error) => (
        <p key={error} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ))}
    </div>
  );
}

/** Joins the ids of a hint and the error container for aria-describedby. */
function describedBy(field: string, hasHint: boolean): string {
  return [hasHint ? `${toId(field)}-hint` : '', errorId(field)].filter(Boolean).join(' ');
}

interface TextFieldProps {
  field: string;
  name?: string;
  label: string;
  errors: FieldErrors;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
  type?: 'text' | 'date' | 'number';
  autoComplete?: string;
  min?: number;
  max?: number;
}

function TextField({
  field,
  name = field,
  label,
  errors,
  defaultValue,
  required,
  hint,
  type = 'text',
  autoComplete = 'off',
  min,
  max,
}: TextFieldProps) {
  const fieldErrors = errors[field];
  return (
    <div>
      <label htmlFor={toId(field)} className={labelClass}>
        {label}
        {required && <span aria-hidden="true" className="text-red-700"> *</span>}
      </label>
      {hint && (
        <p id={`${toId(field)}-hint`} className="mb-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <input
        id={toId(field)}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        min={min}
        max={max}
        step={type === 'number' ? 1 : undefined}
        inputMode={type === 'number' ? 'numeric' : undefined}
        aria-invalid={fieldErrors ? true : undefined}
        aria-describedby={describedBy(field, Boolean(hint))}
        className={inputClass}
      />
      <FieldErrorList field={field} errors={fieldErrors} />
    </div>
  );
}

interface TextAreaFieldProps {
  field: string;
  label: string;
  hint: string;
  errors: FieldErrors;
  defaultValue?: string;
}

function TextAreaField({ field, label, hint, errors, defaultValue }: TextAreaFieldProps) {
  const fieldErrors = errors[field];
  return (
    <div>
      <label htmlFor={toId(field)} className={labelClass}>
        {label}
      </label>
      <p id={`${toId(field)}-hint`} className="mb-1 text-sm text-muted">
        {hint}
      </p>
      <textarea
        id={toId(field)}
        name={field}
        rows={3}
        defaultValue={defaultValue}
        aria-invalid={fieldErrors ? true : undefined}
        aria-describedby={describedBy(field, true)}
        className={inputClass}
      />
      <FieldErrorList field={field} errors={fieldErrors} />
    </div>
  );
}

/** A hymn is two inputs (number + title) grouped under one legend. */
function HymnFields({
  field,
  legend,
  hymn,
  required,
  errors,
}: {
  field: 'openingHymn' | 'sacramentHymn' | 'closingHymn';
  legend: string;
  hymn?: Hymn;
  required: boolean;
  errors: FieldErrors;
}) {
  const planned = hymn && hasHymn(hymn);
  return (
    <fieldset className="grid gap-3 sm:grid-cols-[8rem_1fr]">
      <legend className="mb-1 text-sm font-semibold text-ink">
        {legend}
        {required && <span aria-hidden="true" className="text-red-700"> *</span>}
      </legend>
      <TextField
        field={`${field}.number`}
        name={`${field}Number`}
        label="Number"
        type="number"
        min={1}
        max={9999}
        required={required}
        defaultValue={planned ? String(hymn.number) : ''}
        errors={errors}
      />
      <TextField
        field={`${field}.title`}
        name={`${field}Title`}
        label="Title"
        required={required}
        defaultValue={planned ? hymn.title : ''}
        errors={errors}
      />
    </fieldset>
  );
}

/**
 * A group of fields. Groups that don't apply to the chosen meeting type are
 * hidden AND disabled: disabled controls are left out of the submitted
 * FormData, but keep what was typed in case the type is switched back.
 */
function Section({
  title,
  description,
  hidden = false,
  children,
}: {
  title: string;
  description?: string;
  hidden?: boolean;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <fieldset
      hidden={hidden}
      disabled={hidden}
      aria-labelledby={headingId}
      className="rounded-lg border border-line bg-card p-5 shadow-sm"
    >
      {/* A heading (not just a legend) so screen-reader users can jump between sections. */}
      <h2 id={headingId} className="text-lg font-semibold text-brand-dark">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Speakers and musical numbers (a list the user can add to and remove from)
// ---------------------------------------------------------------------------

interface SpeakerRow {
  key: number;
  initial?: SpeakerItem;
}

function SpeakerList({
  initialSpeakers,
  errors,
  showRowErrors,
  onRowsChange,
}: {
  initialSpeakers: SpeakerItem[];
  errors: FieldErrors;
  /** Row errors refer to row positions, so hide them once rows are added/removed. */
  showRowErrors: boolean;
  onRowsChange: () => void;
}) {
  const [rows, setRows] = useState<SpeakerRow[]>(() =>
    initialSpeakers.map((initial, index) => ({ key: index, initial })),
  );
  const nextKey = useRef(initialSpeakers.length);
  const listRef = useRef<HTMLOListElement>(null);
  const [announcement, setAnnouncement] = useState('');

  function addRow() {
    const key = nextKey.current++;
    setRows((current) => [...current, { key }]);
    setAnnouncement(`Row ${rows.length + 1} added.`);
    onRowsChange();
    // Move focus to the new row's name field once React has rendered it.
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLInputElement>(`[data-row-key="${key}"] input[name="speakerName"]`)
        ?.focus();
    });
  }

  function removeRow(key: number, position: number) {
    setRows((current) => current.filter((row) => row.key !== key));
    setAnnouncement(`Row ${position} removed.`);
    onRowsChange();
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.length === 0 && (
        <p className="text-sm text-muted">No speakers or musical numbers added yet.</p>
      )}

      <ol ref={listRef} className="flex flex-col gap-4">
        {rows.map((row, index) => {
          const base = `speakers.${index}`;
          const rowErrors = showRowErrors ? errors : {};
          const position = index + 1;
          return (
            <li
              key={row.key}
              data-row-key={row.key}
              className="rounded-md border border-line bg-paper p-4"
            >
              <fieldset>
                <legend className="text-sm font-semibold text-muted">
                  Program item {position}
                </legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-[11rem_1fr_1fr]">
                  <div>
                    <label htmlFor={toId(`${base}.type`)} className={labelClass}>
                      Type
                    </label>
                    <select
                      id={toId(`${base}.type`)}
                      name="speakerType"
                      defaultValue={row.initial?.type ?? 'speaker'}
                      aria-invalid={rowErrors[`${base}.type`] ? true : undefined}
                      aria-describedby={errorId(`${base}.type`)}
                      className={inputClass}
                    >
                      <option value="speaker">Speaker</option>
                      <option value="musical-number">Musical number</option>
                    </select>
                    <FieldErrorList field={`${base}.type`} errors={rowErrors[`${base}.type`]} />
                  </div>
                  <TextField
                    field={`${base}.name`}
                    name="speakerName"
                    label="Name or group"
                    required
                    defaultValue={row.initial?.name ?? ''}
                    errors={rowErrors}
                  />
                  <TextField
                    field={`${base}.topic`}
                    name="speakerTopic"
                    label="Topic or song"
                    defaultValue={row.initial?.topic ?? ''}
                    errors={rowErrors}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.key, position)}
                  className="mt-3 text-sm font-semibold text-red-700 underline-offset-2 hover:underline"
                >
                  Remove program item {position}
                </button>
              </fieldset>
            </li>
          );
        })}
      </ol>

      <FieldErrorList field="speakers" errors={errors.speakers} />

      <div>
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-soft"
        >
          + Add speaker or musical number
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The form
// ---------------------------------------------------------------------------

const meetingTypes = Object.entries(meetingTypeLabels) as [MeetingType, string][];

export default function MeetingForm({
  state,
  formAction,
  isPending,
  meeting,
  submitLabel,
  cancelHref,
}: MeetingFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [meetingType, setMeetingType] = useState<MeetingType>(
    meeting?.meetingType ?? 'regular',
  );
  const errors = state.errors ?? {};

  // Speaker errors point at row numbers. Once rows are added or removed
  // those numbers may be wrong, so hide them until the next submit.
  const [rowsChanged, setRowsChanged] = useState(false);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setRowsChanged(false);
  }

  // After a failed submit, move keyboard focus to the first invalid field.
  // Its label and error message (aria-describedby) are then read aloud.
  useEffect(() => {
    if (state.errors && Object.keys(state.errors).length > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  /**
   * React resets a form after its `action` finishes, which would wipe what
   * the user typed when validation fails. Submitting through onSubmit keeps
   * their input. The `action` prop stays as a fallback for when JavaScript
   * hasn't loaded yet (progressive enhancement).
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const isGeneral = meetingType === 'general';
  const isSacrament = isSacramentMeeting(meetingType);
  const hasMessage = Boolean(state.message);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      aria-describedby="form-message"
      className="flex flex-col gap-6"
    >
      <p className="text-sm text-muted">
        Fields marked with <span className="text-red-700">*</span> are required.
      </p>

      <Section title="Sunday">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            field="date"
            label="Date"
            type="date"
            required
            hint="Must be a Sunday."
            defaultValue={meeting?.date ?? ''}
            errors={errors}
          />
          <div>
            <label htmlFor="meetingType" className={labelClass}>
              Meeting type
              <span aria-hidden="true" className="text-red-700"> *</span>
            </label>
            <p id="meetingType-hint" className="mb-1 text-sm text-muted">
              Conference Sundays have no ward program.
            </p>
            <select
              id="meetingType"
              name="meetingType"
              required
              value={meetingType}
              onChange={(event) => setMeetingType(event.target.value as MeetingType)}
              aria-invalid={errors.meetingType ? true : undefined}
              aria-describedby="meetingType-hint meetingType-error"
              className={inputClass}
            >
              {meetingTypes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FieldErrorList field="meetingType" errors={errors.meetingType} />
          </div>
        </div>
      </Section>

      <Section title="Announcements">
        <TextAreaField
          field="announcements"
          label="Announcements"
          hint="One announcement per line."
          defaultValue={meeting?.announcements?.join('\n')}
          errors={errors}
        />
      </Section>

      <Section title="Leaders and opening" hidden={isGeneral}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            field="presiding"
            label="Presiding"
            required
            autoComplete="name"
            defaultValue={meeting?.presiding}
            errors={errors}
          />
          <TextField
            field="conducting"
            label="Conducting"
            required
            autoComplete="name"
            defaultValue={meeting?.conducting}
            errors={errors}
          />
        </div>
        <HymnFields
          field="openingHymn"
          legend="Opening hymn"
          hymn={meeting?.openingHymn}
          required={!isGeneral}
          errors={errors}
        />
        <TextField
          field="openingPrayer"
          label="Opening prayer"
          required
          defaultValue={meeting?.openingPrayer}
          errors={errors}
        />
      </Section>

      <Section title="Business" hidden={isGeneral}>
        {isSacrament && (
          <TextAreaField
            field="wardBusiness"
            label="Ward business"
            hint="Releases, sustainings, baby blessings… One item per line."
            defaultValue={meeting?.wardBusiness.map((item) => item.description).join('\n')}
            errors={errors}
          />
        )}
        <div className="flex items-start gap-3">
          <input
            id="stakeBusiness"
            name="stakeBusiness"
            type="checkbox"
            defaultChecked={meeting?.stakeBusiness ?? false}
            aria-describedby="stakeBusiness-hint"
            className="mt-1 size-4 accent-brand"
          />
          <div>
            <label htmlFor="stakeBusiness" className="text-sm font-semibold text-ink">
              Stake business this Sunday
            </label>
            <p id="stakeBusiness-hint" className="text-sm text-muted">
              Check if a stake leader will present stake business.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Sacrament"
        description="The hymn sung while the sacrament is prepared."
        hidden={!isSacrament}
      >
        <HymnFields
          field="sacramentHymn"
          legend="Sacrament hymn"
          hymn={meeting?.sacramentHymn}
          required={isSacrament}
          errors={errors}
        />
      </Section>

      <Section
        title="Speakers and musical numbers"
        description={
          meetingType === 'testimony'
            ? 'Usually none on fast Sunday: members bear testimony instead.'
            : 'In the order they will take part.'
        }
        hidden={isGeneral}
      >
        <SpeakerList
          initialSpeakers={meeting?.speakers ?? []}
          errors={errors}
          showRowErrors={!rowsChanged}
          onRowsChange={() => setRowsChanged(true)}
        />
      </Section>

      <Section title="Closing" hidden={isGeneral}>
        <HymnFields
          field="closingHymn"
          legend="Closing hymn"
          hymn={meeting?.closingHymn}
          required={!isGeneral}
          errors={errors}
        />
        <TextField
          field="closingPrayer"
          label="Closing prayer"
          required
          defaultValue={meeting?.closingPrayer}
          errors={errors}
        />
      </Section>

      <div id="form-message" aria-live="polite" aria-atomic="true">
        {hasMessage && (
          <p className="rounded-md border border-red-700 bg-red-50 p-3 text-sm text-red-800">
            {state.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <Link href={cancelHref} className="font-semibold text-brand-dark hover:underline">
          Cancel
        </Link>
        <p aria-live="polite" className="sr-only">
          {isPending ? 'Saving the meeting…' : ''}
        </p>
      </div>
    </form>
  );
}
