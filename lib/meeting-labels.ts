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

/** A hymn with number 0 means "no hymn planned" (see NO_HYMN in meetings-db). */
export function hasHymn(hymn: Hymn): boolean {
  return hymn.number > 0;
}
