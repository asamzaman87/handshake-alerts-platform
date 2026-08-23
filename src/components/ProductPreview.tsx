export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-hs-line bg-hs-card shadow-card">
      <div className="border-b border-hs-line bg-hs-bg px-5 py-3">
        <p className="text-center text-sm font-semibold text-hs-ink">
          Manage Handshake Project Alerts
        </p>
      </div>
      <div className="space-y-3 p-5">
        <div className="rounded-xl border border-hs-line bg-hs-bg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-hs-ink">Project Pacemaker</p>
              <p className="mt-1 font-mono text-xs text-hs-muted">
                26a53071-8843-4138-97df-430bd3e4cd45
              </p>
            </div>
            <span className="rounded-full bg-hs-dark px-3 py-1 text-xs font-medium text-white">
              Alerts On
            </span>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-hs-line bg-white px-3 py-2">
              <p className="text-xs text-hs-muted">Last check</p>
              <p className="font-medium text-hs-ink">2 min ago</p>
            </div>
            <div className="rounded-lg border border-hs-line bg-white px-3 py-2">
              <p className="text-xs text-hs-muted">Max alerts</p>
              <p className="font-medium text-hs-ink">3</p>
            </div>
            <div className="rounded-lg border border-hs-line bg-white px-3 py-2">
              <p className="text-xs text-hs-muted">Alerts left</p>
              <p className="font-medium text-hs-ink">2</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-hs-muted">
            Example dashboard view after you sign in and add a project.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-hs-line px-4 py-3 text-center text-sm text-hs-muted">
          Add projects, toggle alerts, set max texts and cooldown hours.
        </div>
      </div>
    </div>
  );
}
