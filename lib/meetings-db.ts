import { neon } from '@neondatabase/serverless';
import type {
  Hymn,
  MeetingType,
  SacramentMeeting,
  SpeakerItem,
  WardBusinessItem,
} from './types';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Run `vercel env pull .env.local` and restart the dev server.',
  );
}

/**
 * neon() returns a tagged template. Every ${value} becomes a query
 * parameter, never part of the SQL text, so user input cannot inject SQL.
 */
const sql = neon(process.env.DATABASE_URL);

export const ITEMS_PER_PAGE = 5;

/** One row of the `meetings` table, as the Neon driver returns it. */
interface MeetingRow {
  id: number;
  iso_date: string; // to_char(date, 'YYYY-MM-DD') added by each SELECT
  meeting_type: MeetingType;
  presiding: string;
  conducting: string;
  announcements: string[] | null;
  opening_hymn: Hymn; // JSONB columns arrive already parsed
  opening_prayer: string;
  ward_business: WardBusinessItem[] | null;
  stake_business: boolean | null;
  sacrament_hymn: Hymn;
  speakers: SpeakerItem[] | null;
  closing_hymn: Hymn;
  closing_prayer: string;
}

/**
 * Converts a snake_case database row into the camelCase SacramentMeeting
 * the rest of the app uses. The date is formatted in SQL (iso_date) so it
 * never shifts with the server's time zone.
 */
function toMeeting(row: MeetingRow): SacramentMeeting {
  return {
    id: row.id,
    date: row.iso_date,
    meetingType: row.meeting_type,
    presiding: row.presiding,
    conducting: row.conducting,
    announcements: row.announcements ?? [],
    openingHymn: row.opening_hymn,
    openingPrayer: row.opening_prayer,
    wardBusiness: row.ward_business ?? [],
    stakeBusiness: row.stake_business ?? false,
    sacramentHymn: row.sacrament_hymn,
    speakers: row.speakers ?? [],
    closingHymn: row.closing_hymn,
    closingPrayer: row.closing_prayer,
  };
}

/**
 * Turns the search box text into an ILIKE pattern. % and _ are wildcards in
 * ILIKE, so they are escaped to match the literal characters the user typed.
 */
function toSearchPattern(query: string): string {
  const escaped = query.trim().replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
}

/**
 * Meetings matching the search text (presiding, conducting, meeting type,
 * or any speaker), newest first, ITEMS_PER_PAGE at a time.
 */
export async function getMeetings(
  query: string = '',
  currentPage: number = 1,
): Promise<SacramentMeeting[]> {
  const searchTerm = toSearchPattern(query);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const rows = await sql`
    SELECT *, to_char(date, 'YYYY-MM-DD') AS iso_date
    FROM meetings
    WHERE presiding     ILIKE ${searchTerm}
       OR conducting    ILIKE ${searchTerm}
       OR meeting_type  ILIKE ${searchTerm}
       OR speakers::text ILIKE ${searchTerm}
    ORDER BY date DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `;
  return (rows as MeetingRow[]).map(toMeeting);
}

/** How many pages getMeetings() has for this search text. */
export async function getMeetingsTotalPages(
  query: string = '',
): Promise<number> {
  const searchTerm = toSearchPattern(query);

  const rows = await sql`
    SELECT COUNT(*) AS count
    FROM meetings
    WHERE presiding     ILIKE ${searchTerm}
       OR conducting    ILIKE ${searchTerm}
       OR meeting_type  ILIKE ${searchTerm}
       OR speakers::text ILIKE ${searchTerm}
  `;
  // COUNT(*) is a bigint, which the driver returns as a string.
  return Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE);
}

/** Every meeting, newest first. Used by GET /api/meetings. */
export async function getAllMeetings(): Promise<SacramentMeeting[]> {
  const rows = await sql`
    SELECT *, to_char(date, 'YYYY-MM-DD') AS iso_date
    FROM meetings
    ORDER BY date DESC
  `;
  return (rows as MeetingRow[]).map(toMeeting);
}

/** The meeting held on a 'YYYY-MM-DD' date, or null. Dates are unique. */
export async function getMeetingByDate(
  date: string,
): Promise<SacramentMeeting | null> {
  const rows = await sql`
    SELECT *, to_char(date, 'YYYY-MM-DD') AS iso_date
    FROM meetings
    WHERE date = ${date}
  `;
  const row = (rows as MeetingRow[])[0];
  return row ? toMeeting(row) : null;
}

/** Largest value a SERIAL (int4) column can hold. */
const MAX_SERIAL_ID = 2_147_483_647;

/**
 * True for a number that could be a row id. NaN, decimals, or ids past the
 * int4 range can't exist, and Postgres would throw on the out-of-range ones.
 */
export function isValidMeetingId(id: number): boolean {
  return Number.isInteger(id) && id >= 1 && id <= MAX_SERIAL_ID;
}

export async function getMeetingById(
  id: number,
): Promise<SacramentMeeting | null> {
  if (!isValidMeetingId(id)) return null;

  const rows = await sql`
    SELECT *, to_char(date, 'YYYY-MM-DD') AS iso_date
    FROM meetings
    WHERE id = ${id}
  `;
  const row = (rows as MeetingRow[])[0];
  return row ? toMeeting(row) : null;
}

/** Everything needed to save a meeting; the database assigns the id. */
export type MeetingInput = Omit<SacramentMeeting, 'id'>;

/**
 * Postgres error code for a UNIQUE constraint violation. The `date` column
 * is UNIQUE, so this means "a meeting is already planned for that Sunday".
 */
const UNIQUE_VIOLATION = '23505';

/** True when a database error came from the UNIQUE (date) constraint. */
export function isDuplicateDateError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === UNIQUE_VIOLATION
  );
}

/**
 * Inserts a meeting and returns it with its new id.
 * JSONB values are sent as JSON text and cast; arrays become TEXT[].
 */
export async function addMeeting(data: MeetingInput): Promise<SacramentMeeting> {
  const rows = await sql`
    INSERT INTO meetings (
      date, meeting_type, presiding, conducting, announcements,
      opening_hymn, opening_prayer, ward_business, stake_business,
      sacrament_hymn, speakers, closing_hymn, closing_prayer
    ) VALUES (
      ${data.date}::date,
      ${data.meetingType},
      ${data.presiding},
      ${data.conducting},
      ${data.announcements ?? []}::text[],
      ${JSON.stringify(data.openingHymn)}::jsonb,
      ${data.openingPrayer},
      ${JSON.stringify(data.wardBusiness)}::jsonb,
      ${data.stakeBusiness},
      ${JSON.stringify(data.sacramentHymn)}::jsonb,
      ${JSON.stringify(data.speakers)}::jsonb,
      ${JSON.stringify(data.closingHymn)}::jsonb,
      ${data.closingPrayer}
    )
    RETURNING *, to_char(date, 'YYYY-MM-DD') AS iso_date
  `;
  return toMeeting((rows as MeetingRow[])[0]);
}

/**
 * Replaces every field of an existing meeting (the edit form always sends
 * the whole meeting). Returns the saved meeting, or null if the id is gone.
 */
export async function updateMeeting(
  id: number,
  data: MeetingInput,
): Promise<SacramentMeeting | null> {
  if (!isValidMeetingId(id)) return null;

  const rows = await sql`
    UPDATE meetings SET
      date           = ${data.date}::date,
      meeting_type   = ${data.meetingType},
      presiding      = ${data.presiding},
      conducting     = ${data.conducting},
      announcements  = ${data.announcements ?? []}::text[],
      opening_hymn   = ${JSON.stringify(data.openingHymn)}::jsonb,
      opening_prayer = ${data.openingPrayer},
      ward_business  = ${JSON.stringify(data.wardBusiness)}::jsonb,
      stake_business = ${data.stakeBusiness},
      sacrament_hymn = ${JSON.stringify(data.sacramentHymn)}::jsonb,
      speakers       = ${JSON.stringify(data.speakers)}::jsonb,
      closing_hymn   = ${JSON.stringify(data.closingHymn)}::jsonb,
      closing_prayer = ${data.closingPrayer}
    WHERE id = ${id}
    RETURNING *, to_char(date, 'YYYY-MM-DD') AS iso_date
  `;
  const row = (rows as MeetingRow[])[0];
  return row ? toMeeting(row) : null;
}

/** Deletes one meeting. Returns false when no meeting had that id. */
export async function deleteMeeting(id: number): Promise<boolean> {
  if (!isValidMeetingId(id)) return false;

  const rows = await sql`
    DELETE FROM meetings
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}
