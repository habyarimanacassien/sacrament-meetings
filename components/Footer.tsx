import { site } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-card print:hidden">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted sm:px-6">
        <p>
          {site.appName} for the {site.wardName}.
        </p>
        <p>WDD 430 student project. Not an official Church website.</p>
      </div>
    </footer>
  );
}
