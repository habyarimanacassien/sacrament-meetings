/** Loading state for leader-facing (admin) pages only. */
export default function AdminLoading() {
  return (
    <div role="status" className="flex flex-col gap-3">
      <p className="text-muted">Loading leader tools…</p>
      <div
        aria-hidden="true"
        className="h-40 animate-pulse rounded-lg border border-line bg-card"
      />
    </div>
  );
}
