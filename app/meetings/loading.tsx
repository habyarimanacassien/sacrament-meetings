export default function MeetingsLoading() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <p className="text-muted">Loading meetings…</p>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-32 animate-pulse rounded-lg border border-line bg-card"
          />
        ))}
      </div>
    </div>
  );
}
