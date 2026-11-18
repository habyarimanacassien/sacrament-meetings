import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';

const features = [
  {
    title: 'Plan each Sunday',
    text: 'Keep hymns, prayers, ward business, speakers, and musical numbers together in one agenda.',
  },
  {
    title: 'Review past meetings',
    text: 'Look back at earlier programs to see who has spoken and which hymns were sung.',
  },
  {
    title: 'Print the program',
    text: 'Open any meeting and print a clean, one-page program for members.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            {site.wardName}
          </p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight text-brand-dark">
            {site.appName}
          </h1>
          <p className="mt-4 text-lg text-muted">
            A simple place for the bishopric to plan sacrament meeting agendas,
            and for members to view and print this week&apos;s program.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/meetings/current"
              className="rounded-md bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              This Sunday&apos;s program
            </Link>
            <Link
              href="/meetings"
              className="rounded-md border border-brand px-5 py-3 font-semibold text-brand-dark hover:bg-brand-soft"
            >
              View all meetings
            </Link>
          </div>
        </div>
        <Image
          src="/chapel.svg"
          alt="Illustration of a chapel with a steeple on green hills"
          width={640}
          height={420}
          priority
          className="h-auto w-full rounded-3xl"
        />
      </section>

      <section aria-labelledby="features-heading" className="mt-12">
        <h2 id="features-heading" className="text-2xl font-semibold">
          What you can do
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="rounded-lg border border-line bg-card p-5"
            >
              <h3 className="text-lg font-semibold text-brand-dark">
                {feature.title}
              </h3>
              <p className="mt-1 text-muted">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
