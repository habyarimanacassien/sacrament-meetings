import { formatLongDate } from '@/lib/dates';
import {
  hasHymn,
  isSacramentMeeting,
  meetingTypeLabels,
} from '@/lib/meeting-labels';
import { site } from '@/lib/site';
import type { Hymn, SacramentMeeting } from '@/lib/types';

interface MeetingDetailProps {
  meeting: SacramentMeeting;
}

interface AgendaRowProps {
  label: string;
  value: string;
  detail?: string;
}

/** One line of the program: label on the left, value on the right. */
function AgendaRow({ label, value, detail }: AgendaRowProps) {
  return (
    <div className="grid gap-x-6 gap-y-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[11rem_1fr]">
      <dt className="text-sm font-semibold text-muted">{label}</dt>
      <dd>
        {value}
        {detail && <span className="block text-sm text-muted">{detail}</span>}
      </dd>
    </div>
  );
}

function hymnText(hymn: Hymn): string {
  return `#${hymn.number} ${hymn.title}`;
}

export default function MeetingDetail({ meeting }: MeetingDetailProps) {
  const sacrament = isSacramentMeeting(meeting.meetingType);
  const announcements = meeting.announcements ?? [];

  return (
    <article className="rounded-lg border border-line bg-card p-6 shadow-sm sm:p-8 print:border-0 print:p-0 print:shadow-none">
      <header className="border-b-2 border-brand pb-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {site.wardName}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-brand-dark">
          {meetingTypeLabels[meeting.meetingType]}
        </h1>
        <p className="mt-1 text-lg">
          <time dateTime={meeting.date}>{formatLongDate(meeting.date)}</time>
        </p>
      </header>

      {!sacrament && (
        <p className="mt-6 rounded-md bg-brand-soft p-4 text-brand-dark">
          {meeting.meetingType === 'general'
            ? 'General conference weekend. No ward sacrament meeting is held this Sunday.'
            : 'Stake conference. No ward sacrament meeting is held this Sunday.'}
        </p>
      )}

      {announcements.length > 0 && (
        <section aria-labelledby="announcements-heading" className="mt-6">
          <h2 id="announcements-heading" className="text-xl font-semibold">
            Announcements
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {announcements.map((announcement) => (
              <li key={announcement}>{announcement}</li>
            ))}
          </ul>
        </section>
      )}

      {meeting.meetingType !== 'general' && (
        <section aria-labelledby="program-heading" className="mt-6">
          <h2 id="program-heading" className="text-xl font-semibold">
            Program
          </h2>
          <dl className="mt-2">
            {meeting.presiding && (
              <AgendaRow label="Presiding" value={meeting.presiding} />
            )}
            {meeting.conducting && (
              <AgendaRow label="Conducting" value={meeting.conducting} />
            )}
            {hasHymn(meeting.openingHymn) && (
              <AgendaRow
                label="Opening Hymn"
                value={hymnText(meeting.openingHymn)}
              />
            )}
            {meeting.openingPrayer && (
              <AgendaRow label="Opening Prayer" value={meeting.openingPrayer} />
            )}

            {sacrament && (
              <div className="grid gap-x-6 gap-y-1 border-b border-line py-3 sm:grid-cols-[11rem_1fr]">
                <dt className="text-sm font-semibold text-muted">
                  Ward Business
                </dt>
                <dd>
                  {meeting.wardBusiness.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-5">
                      {meeting.wardBusiness.map((item) => (
                        <li key={item.description}>{item.description}</li>
                      ))}
                    </ul>
                  ) : (
                    'None'
                  )}
                </dd>
              </div>
            )}

            <AgendaRow
              label="Stake Business"
              value={meeting.stakeBusiness ? 'Yes' : 'No'}
            />

            {sacrament && hasHymn(meeting.sacramentHymn) && (
              <AgendaRow
                label="Sacrament Hymn"
                value={hymnText(meeting.sacramentHymn)}
                detail="Blessing and passing of the sacrament"
              />
            )}

            {meeting.meetingType === 'testimony' && (
              <AgendaRow
                label="Testimonies"
                value="Bearing of testimonies by members of the congregation"
              />
            )}

            {meeting.speakers.map((item) => (
              <AgendaRow
                key={`${item.type}-${item.name}`}
                label={item.type === 'speaker' ? 'Speaker' : 'Musical Number'}
                value={item.name}
                detail={item.topic || undefined}
              />
            ))}

            {hasHymn(meeting.closingHymn) && (
              <AgendaRow
                label="Closing Hymn"
                value={hymnText(meeting.closingHymn)}
              />
            )}
            {meeting.closingPrayer && (
              <AgendaRow label="Closing Prayer" value={meeting.closingPrayer} />
            )}
          </dl>
        </section>
      )}
    </article>
  );
}
