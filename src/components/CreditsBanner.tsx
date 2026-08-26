import Link from "next/link";

export function CreditsBanner({ credits }: { credits: number | null }) {
  const balance = credits ?? null;
  const out = balance !== null && balance <= 0;

  return (
    <div
      className={`rounded-2xl border p-5 shadow-card ${
        out
          ? "border-amber-200 bg-amber-50"
          : "border-hs-line bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-hs-ink">Your alert credits</p>
          <p className="mt-2 text-sm leading-relaxed text-hs-muted">
            Each credit sends one SMS when claimable tasks show up. New accounts
            start with 5 free credits. When you run out, alerts pause until you
            buy more.
          </p>
          <p className="mt-4 inline-flex items-center rounded-full border border-hs-line bg-white px-4 py-2 text-base font-semibold tracking-tight text-hs-ink tabular-nums">
            {balance === null
              ? "…"
              : `${balance} credit${balance === 1 ? "" : "s"} left`}
          </p>
          {out ? (
            <p className="mt-3 text-sm font-medium text-amber-950">
              You’re out of credits — alerts won’t send until you top up.
            </p>
          ) : null}
        </div>
        <Link
          href="/credits/"
          className={
            out
              ? "btn-primary shrink-0"
              : "shrink-0 rounded-full border border-hs-line bg-hs-bg px-4 py-2.5 text-sm font-semibold text-hs-ink transition hover:bg-white"
          }
        >
          {out ? "Buy credits" : "Buy more credits"}
        </Link>
      </div>
    </div>
  );
}
