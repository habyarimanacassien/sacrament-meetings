import type { Hymn, MeetingType } from './types';

export const meetingTypeLabels: Record<MeetingType, string> = {
  testimony: 'Fast & Testimony Meeting',
  regular: 'Sacrament Meeting',
  stake: 'Stake Conference',
  general: 'General Conference',
};

/** Stake and general conference Sundays have no ward sacrament meeting. */
export function isSacramentMeeting(type: MeetingType): boolean {
  return type === 'testimony' || type === 'regular';
}

/**
 * Stored for hymns a meeting doesn't have (for example, no sacrament hymn at
 * a stake conference). The UI hides any hymn whose number is 0.
 */
export const NO_HYMN: Hymn = { number: 0, title: '' };

/** A hymn with number 0 means "no hymn planned" (see NO_HYMN above). */
export function hasHymn(hymn: Hymn): boolean {
  return hymn.number > 0;
}
