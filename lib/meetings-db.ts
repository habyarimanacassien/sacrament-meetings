import type { Hymn, SacramentMeeting } from './types';

/**
 * `SacramentMeeting` requires every hymn field, but stake and general
 * conference Sundays have no ward sacrament meeting. Those records use
 * NO_HYMN (number 0) and the UI skips it.
 */
const NO_HYMN: Hymn = { number: 0, title: '' };

const meetings: SacramentMeeting[] = [
  {
    id: 1,
    date: '2026-05-03',
    meetingType: 'testimony',
    presiding: 'Bishop Smith',
    conducting: 'Brother Jones',
    announcements: ['Ward temple night: May 10'],
    openingHymn: { number: 2, title: 'The Spirit of God' },
    openingPrayer: 'Sister Williams',
    wardBusiness: [{ description: 'Sustaining of new Primary president' }],
    stakeBusiness: false,
    sacramentHymn: { number: 193, title: 'I Stand All Amazed' },
    speakers: [],
    closingHymn: { number: 136, title: 'I Know That My Redeemer Lives' },
    closingPrayer: 'Brother Davis',
  },
  {
    id: 2,
    date: '2026-10-04',
    meetingType: 'general',
    presiding: '',
    conducting: '',
    announcements: [
      'General conference is broadcast Saturday and Sunday. No ward meetings are held.',
      'Fast Sunday moves to October 11.',
    ],
    openingHymn: NO_HYMN,
    openingPrayer: '',
    wardBusiness: [],
    stakeBusiness: false,
    sacramentHymn: NO_HYMN,
    speakers: [],
    closingHymn: NO_HYMN,
    closingPrayer: '',
  },
  {
    id: 3,
    date: '2026-10-18',
    meetingType: 'stake',
    presiding: 'President Okafor',
    conducting: 'President Martins',
    announcements: [
      'Stake conference general session starts at 10:00 a.m. in the stake center.',
    ],
    openingHymn: { number: 19, title: 'We Thank Thee, O God, for a Prophet' },
    openingPrayer: 'Brother Nkosi',
    wardBusiness: [],
    stakeBusiness: true,
    sacramentHymn: NO_HYMN,
    speakers: [
      { name: 'Sister Abena Mensah', topic: 'Ministering as the Savior did', type: 'speaker' },
      { name: 'Stake Choir', topic: 'Come, Thou Fount of Every Blessing', type: 'musical-number' },
      { name: 'President Okafor', topic: 'Building Zion in our homes', type: 'speaker' },
    ],
    closingHymn: { number: 85, title: 'How Firm a Foundation' },
    closingPrayer: 'Sister Dlamini',
  },
  {
    id: 4,
    date: '2026-10-25',
    meetingType: 'regular',
    presiding: 'Bishop Smith',
    conducting: 'Brother Mokoena',
    announcements: [
      'Youth activity: Wednesday at 6:30 p.m.',
      'Ward choir practice after church in the chapel.',
    ],
    openingHymn: { number: 30, title: 'Come, Come, Ye Saints' },
    openingPrayer: 'Brother Banda',
    wardBusiness: [{ description: 'Release of Sister Phiri as Relief Society secretary' }],
    stakeBusiness: false,
    sacramentHymn: { number: 172, title: 'In Humility, Our Savior' },
    speakers: [
      { name: 'Brother Tendai Moyo', topic: 'Finding joy in repentance', type: 'speaker' },
      { name: 'Sister Grace Kamau', topic: 'The covenant path', type: 'speaker' },
    ],
    closingHymn: { number: 98, title: 'I Need Thee Every Hour' },
    closingPrayer: 'Sister Zulu',
  },
  {
    id: 5,
    date: '2026-11-01',
    meetingType: 'testimony',
    presiding: 'Bishop Smith',
    conducting: 'Bishop Smith',
    announcements: ['Fast offerings can be given online or to a member of the bishopric.'],
    openingHymn: { number: 134, title: 'I Believe in Christ' },
    openingPrayer: 'Sister Chanda',
    wardBusiness: [
      { description: 'Sustaining of Brother Ncube as Sunday School teacher' },
      { description: 'Blessing of the Mutasa baby' },
    ],
    stakeBusiness: false,
    sacramentHymn: { number: 176, title: "'Tis Sweet to Sing the Matchless Love" },
    speakers: [],
    closingHymn: { number: 142, title: 'Sweet Hour of Prayer' },
    closingPrayer: 'Brother Sithole',
  },
  {
    id: 6,
    date: '2026-11-08',
    meetingType: 'regular',
    presiding: 'Bishop Smith',
    conducting: 'Brother Jones',
    announcements: [
      'Ward temple night: Friday, November 13.',
      'Stake family history fair: Saturday, November 21.',
    ],
    openingHymn: { number: 6, title: 'Redeemer of Israel' },
    openingPrayer: 'Brother Tembo',
    wardBusiness: [],
    stakeBusiness: true,
    sacramentHymn: { number: 181, title: 'Jesus of Nazareth, Savior and King' },
    speakers: [
      { name: 'Sister Naledi Khumalo', topic: 'Gratitude in all things', type: 'speaker' },
      { name: 'Primary Children', topic: 'I Am a Child of God', type: 'musical-number' },
      { name: 'Brother Samuel Osei', topic: 'Serving in the temple', type: 'speaker' },
    ],
    closingHymn: { number: 241, title: 'Count Your Blessings' },
    closingPrayer: 'Sister Mwale',
  },
  {
    id: 7,
    date: '2026-11-15',
    meetingType: 'regular',
    presiding: 'Bishop Smith',
    conducting: 'Brother Mokoena',
    announcements: ['Thanksgiving service project sign-up sheet is in the foyer.'],
    openingHymn: { number: 219, title: 'Because I Have Been Given Much' },
    openingPrayer: 'Sister Moyo',
    wardBusiness: [{ description: 'Sustaining of new Young Women class presidency' }],
    stakeBusiness: false,
    sacramentHymn: { number: 182, title: "We'll Sing All Hail to Jesus' Name" },
    speakers: [
      { name: 'Brother Daniel Phiri', topic: 'Lord, I would follow Thee', type: 'speaker' },
      { name: 'Sister Ruth Adeyemi', topic: 'Charity never faileth', type: 'speaker' },
      { name: 'Ward Choir', topic: 'Have I Done Any Good?', type: 'musical-number' },
      { name: 'Elder Thomas Wright', topic: 'Sharing the gospel with love', type: 'speaker' },
    ],
    closingHymn: { number: 220, title: 'Lord, I Would Follow Thee' },
    closingPrayer: 'Brother Chirwa',
  },
  {
    id: 8,
    date: '2026-11-22',
    meetingType: 'regular',
    presiding: 'Bishop Smith',
    conducting: 'Brother Jones',
    announcements: ['Tithing declaration appointments begin next Sunday.'],
    openingHymn: { number: 58, title: 'Come, Ye Children of the Lord' },
    openingPrayer: 'Brother Mahlangu',
    wardBusiness: [],
    stakeBusiness: false,
    sacramentHymn: { number: 173, title: 'While of These Emblems We Partake' },
    speakers: [
      { name: 'Sister Faith Ndlovu', topic: 'Prayer in our families', type: 'speaker' },
      { name: 'Brother Peter Mensah', topic: 'The Book of Mormon in my life', type: 'speaker' },
    ],
    closingHymn: { number: 152, title: 'God Be with You Till We Meet Again' },
    closingPrayer: 'Sister Banda',
  },
  {
    id: 9,
    date: '2026-11-29',
    meetingType: 'regular',
    presiding: 'Bishop Smith',
    conducting: 'Brother Mokoena',
    announcements: ['Ward Christmas devotional: Sunday, December 13 at 5:00 p.m.'],
    openingHymn: { number: 66, title: 'Rejoice, the Lord Is King!' },
    openingPrayer: 'Sister Okafor',
    wardBusiness: [],
    stakeBusiness: false,
    sacramentHymn: { number: 194, title: 'There Is a Green Hill Far Away' },
    speakers: [
      { name: 'Sister Lerato Molefe', topic: 'Preparing our hearts for Christmas', type: 'speaker' },
      { name: 'Young Women', topic: 'Come, Follow Me', type: 'musical-number' },
      { name: 'Brother Joseph Tembo', topic: 'The Light of the World', type: 'speaker' },
    ],
    closingHymn: { number: 116, title: 'Come, Follow Me' },
    closingPrayer: 'Brother Zulu',
  },
];

/** Returns all meetings, or only those on the given 'YYYY-MM-DD' date. */
export function getMeetings(date?: string | null): SacramentMeeting[] {
  if (date) return meetings.filter((m) => m.date === date);
  return meetings;
}

export function getMeetingById(id: number): SacramentMeeting | null {
  return meetings.find((m) => m.id === id) ?? null;
}
