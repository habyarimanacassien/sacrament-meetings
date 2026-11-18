-- Sacrament Meeting Planner: table + sample data (W03 Step 6).
-- Paste this whole file into Vercel → Storage → your database → Query, then Run.
-- Safe to run more than once: the table is only created if missing, and
-- ON CONFLICT (date) skips meetings that are already in the table.

CREATE TABLE IF NOT EXISTS meetings (
  id              SERIAL        PRIMARY KEY,
  date            DATE          NOT NULL UNIQUE,
  meeting_type    VARCHAR(20)   NOT NULL
                  CHECK (meeting_type IN ('testimony', 'regular', 'stake', 'general')),
  presiding       VARCHAR(255)  NOT NULL,
  conducting      VARCHAR(255)  NOT NULL,
  announcements   TEXT[]        DEFAULT '{}',
  opening_hymn    JSONB         NOT NULL,
  opening_prayer  VARCHAR(255)  NOT NULL,
  ward_business   JSONB         DEFAULT '[]',
  stake_business  BOOLEAN       DEFAULT false,
  sacrament_hymn  JSONB         NOT NULL,
  speakers        JSONB         DEFAULT '[]',
  closing_hymn    JSONB         NOT NULL,
  closing_prayer  VARCHAR(255)  NOT NULL
);

-- Stake and general conference Sundays have no ward sacrament meeting.
-- Their unused hymns are stored as {"number":0,"title":""} and the UI hides them.

INSERT INTO meetings (
  date, meeting_type, presiding, conducting, announcements,
  opening_hymn, opening_prayer, ward_business, stake_business,
  sacrament_hymn, speakers, closing_hymn, closing_prayer
) VALUES
(
  '2026-01-04', 'testimony', 'Bishop Smith', 'Brother Nkurunziza',
  ARRAY['Ward New Year social: Friday, January 9 at 6:00 p.m.'],
  '{"number":3,"title":"Now Let Us Rejoice"}', 'Sister Uwase',
  '[{"description":"Sustaining of Brother Habimana as ward clerk"}]', false,
  '{"number":169,"title":"As Now We Take the Sacrament"}',
  '[]',
  '{"number":239,"title":"Choose the Right"}', 'Brother Mugisha'
),
(
  '2026-02-08', 'regular', 'Bishop Smith', 'Brother Jones',
  ARRAY['Youth temple trip sign-ups close February 15.'],
  '{"number":26,"title":"Joseph Smith''s First Prayer"}', 'Sister Ingabire',
  '[]', false,
  '{"number":175,"title":"O God, the Eternal Father"}',
  '[{"name":"Sister Claudine Mukamana","topic":"Hearing Him through the scriptures","type":"speaker"},
    {"name":"Brother Eric Ndayisaba","topic":"Faith to act","type":"speaker"}]',
  '{"number":140,"title":"Did You Think to Pray?"}', 'Brother Kayitare'
),
(
  '2026-03-01', 'testimony', 'Bishop Smith', 'Brother Mokoena',
  ARRAY['Fast offerings can be given online or to a member of the bishopric.'],
  '{"number":7,"title":"Israel, Israel, God Is Calling"}', 'Brother Nsengiyumva',
  '[{"description":"Release of Sister Uwimana as Primary pianist"},
    {"description":"Blessing of the Kamanzi baby"}]', false,
  '{"number":191,"title":"Behold the Great Redeemer Die"}',
  '[]',
  '{"number":100,"title":"Nearer, My God, to Thee"}', 'Sister Mukeshimana'
),
(
  '2026-04-05', 'general', '', '',
  ARRAY['April general conference is broadcast Saturday and Sunday. No ward meetings are held.'],
  '{"number":0,"title":""}', '',
  '[]', false,
  '{"number":0,"title":""}',
  '[]',
  '{"number":0,"title":""}', ''
),
(
  '2026-05-03', 'testimony', 'Bishop Smith', 'Brother Jones',
  ARRAY['Ward temple night: May 10'],
  '{"number":2,"title":"The Spirit of God"}', 'Sister Williams',
  '[{"description":"Sustaining of new Primary president"}]', false,
  '{"number":193,"title":"I Stand All Amazed"}',
  '[]',
  '{"number":136,"title":"I Know That My Redeemer Lives"}', 'Brother Davis'
),
(
  '2026-06-14', 'regular', 'Bishop Smith', 'Brother Nkurunziza',
  ARRAY['Girls camp begins June 22. Packing lists are in the foyer.'],
  '{"number":27,"title":"Praise to the Man"}', 'Sister Mutoni',
  '[{"description":"Sustaining of Sister Keza as Young Women adviser"}]', true,
  '{"number":187,"title":"God Loved Us, So He Sent His Son"}',
  '[{"name":"Brother Olivier Twagirayezu","topic":"Fathers who lead with love","type":"speaker"},
    {"name":"Primary Children","topic":"Love Is Spoken Here","type":"musical-number"},
    {"name":"Bishop Smith","topic":"Strengthening our families","type":"speaker"}]',
  '{"number":29,"title":"A Poor Wayfaring Man of Grief"}', 'Brother Rukundo'
),
(
  '2026-10-04', 'general', '', '',
  ARRAY['General conference is broadcast Saturday and Sunday. No ward meetings are held.',
        'Fast Sunday moves to October 11.'],
  '{"number":0,"title":""}', '',
  '[]', false,
  '{"number":0,"title":""}',
  '[]',
  '{"number":0,"title":""}', ''
),
(
  '2026-10-18', 'stake', 'President Okafor', 'President Martins',
  ARRAY['Stake conference general session starts at 10:00 a.m. in the stake center.'],
  '{"number":19,"title":"We Thank Thee, O God, for a Prophet"}', 'Brother Nkosi',
  '[]', true,
  '{"number":0,"title":""}',
  '[{"name":"Sister Abena Mensah","topic":"Ministering as the Savior did","type":"speaker"},
    {"name":"Stake Choir","topic":"Come, Thou Fount of Every Blessing","type":"musical-number"},
    {"name":"President Okafor","topic":"Building Zion in our homes","type":"speaker"}]',
  '{"number":85,"title":"How Firm a Foundation"}', 'Sister Dlamini'
),
(
  '2026-10-25', 'regular', 'Bishop Smith', 'Brother Mokoena',
  ARRAY['Youth activity: Wednesday at 6:30 p.m.', 'Ward choir practice after church in the chapel.'],
  '{"number":30,"title":"Come, Come, Ye Saints"}', 'Brother Banda',
  '[{"description":"Release of Sister Phiri as Relief Society secretary"}]', false,
  '{"number":172,"title":"In Humility, Our Savior"}',
  '[{"name":"Brother Tendai Moyo","topic":"Finding joy in repentance","type":"speaker"},
    {"name":"Sister Grace Kamau","topic":"The covenant path","type":"speaker"}]',
  '{"number":98,"title":"I Need Thee Every Hour"}', 'Sister Zulu'
),
(
  '2026-11-01', 'testimony', 'Bishop Smith', 'Bishop Smith',
  ARRAY['Fast offerings can be given online or to a member of the bishopric.'],
  '{"number":134,"title":"I Believe in Christ"}', 'Sister Chanda',
  '[{"description":"Sustaining of Brother Ncube as Sunday School teacher"},
    {"description":"Blessing of the Mutasa baby"}]', false,
  '{"number":176,"title":"''Tis Sweet to Sing the Matchless Love"}',
  '[]',
  '{"number":142,"title":"Sweet Hour of Prayer"}', 'Brother Sithole'
),
(
  '2026-11-08', 'regular', 'Bishop Smith', 'Brother Jones',
  ARRAY['Ward temple night: Friday, November 13.', 'Stake family history fair: Saturday, November 21.'],
  '{"number":6,"title":"Redeemer of Israel"}', 'Brother Tembo',
  '[]', true,
  '{"number":181,"title":"Jesus of Nazareth, Savior and King"}',
  '[{"name":"Sister Naledi Khumalo","topic":"Gratitude in all things","type":"speaker"},
    {"name":"Primary Children","topic":"I Am a Child of God","type":"musical-number"},
    {"name":"Brother Samuel Osei","topic":"Serving in the temple","type":"speaker"}]',
  '{"number":241,"title":"Count Your Blessings"}', 'Sister Mwale'
),
(
  '2026-11-15', 'regular', 'Bishop Smith', 'Brother Mokoena',
  ARRAY['Thanksgiving service project sign-up sheet is in the foyer.'],
  '{"number":219,"title":"Because I Have Been Given Much"}', 'Sister Moyo',
  '[{"description":"Sustaining of new Young Women class presidency"}]', false,
  '{"number":182,"title":"We''ll Sing All Hail to Jesus'' Name"}',
  '[{"name":"Brother Daniel Phiri","topic":"Lord, I would follow Thee","type":"speaker"},
    {"name":"Sister Ruth Adeyemi","topic":"Charity never faileth","type":"speaker"},
    {"name":"Ward Choir","topic":"Have I Done Any Good?","type":"musical-number"},
    {"name":"Elder Thomas Wright","topic":"Sharing the gospel with love","type":"speaker"}]',
  '{"number":220,"title":"Lord, I Would Follow Thee"}', 'Brother Chirwa'
),
(
  '2026-11-22', 'regular', 'Bishop Smith', 'Brother Jones',
  ARRAY['Tithing declaration appointments begin next Sunday.'],
  '{"number":58,"title":"Come, Ye Children of the Lord"}', 'Brother Mahlangu',
  '[]', false,
  '{"number":173,"title":"While of These Emblems We Partake"}',
  '[{"name":"Sister Faith Ndlovu","topic":"Prayer in our families","type":"speaker"},
    {"name":"Brother Peter Mensah","topic":"The Book of Mormon in my life","type":"speaker"}]',
  '{"number":152,"title":"God Be with You Till We Meet Again"}', 'Sister Banda'
),
(
  '2026-11-29', 'regular', 'Bishop Smith', 'Brother Mokoena',
  ARRAY['Ward Christmas devotional: Sunday, December 13 at 5:00 p.m.'],
  '{"number":66,"title":"Rejoice, the Lord Is King!"}', 'Sister Okafor',
  '[]', false,
  '{"number":194,"title":"There Is a Green Hill Far Away"}',
  '[{"name":"Sister Lerato Molefe","topic":"Preparing our hearts for Christmas","type":"speaker"},
    {"name":"Young Women","topic":"Come, Follow Me","type":"musical-number"},
    {"name":"Brother Joseph Tembo","topic":"The Light of the World","type":"speaker"}]',
  '{"number":116,"title":"Come, Follow Me"}', 'Brother Zulu'
),
(
  '2026-12-06', 'testimony', 'Bishop Smith', 'Brother Nkurunziza',
  ARRAY['Light the World giving machines open at the stake center through December 20.'],
  '{"number":201,"title":"Joy to the World"}', 'Sister Uwamahoro',
  '[{"description":"Sustaining of Brother Gasana as elders quorum secretary"}]', false,
  '{"number":196,"title":"Jesus, Once of Humble Birth"}',
  '[]',
  '{"number":204,"title":"Silent Night"}', 'Brother Hakizimana'
)
ON CONFLICT (date) DO NOTHING;

-- Check: should list 15 meetings, newest first.
SELECT id, date, meeting_type, presiding, conducting FROM meetings ORDER BY date DESC;
