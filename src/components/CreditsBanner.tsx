import Link from "next/link";

export function CreditsBanner({
  credits,
  compact = false,
}: {
  credits: number | null;
  compact?: boolean;
}) {
  const balance = credits ?? null;
  const out = balance !== null && balance <= 0;

  if (compact) {
    return (
      <div
        className={`rounded-2xl border p-4 shadow-card md:self-start ${
          out ? "border-red-200 bg-red-50" : "border-hs-line bg-white"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-hs-muted">
          Alert credits
        </p>
        <p
          className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${
            out ? "text-red-700" : "text-hs-ink"
          }`}
        >
          {balance === null
            ? "…"
            : `${balance}`}
          <span className="ml-1.5 text-sm font-semibold text-hs-muted">
            left
          </span>
        </p>
        <p className="mt-1.5 text-xs leading-snug text-hs-muted">
          1 credit = 1 SMS alert
        </p>
        {out ? (
          <p className="mt-2 text-xs font-semibold leading-snug text-red-700">
            No alerts until you buy more.
          </p>
        ) : null}
        <Link href="/credits/" className="btn-primary-sm mt-3 w-full">
          {out ? "Buy credits" : "Buy more"}
          <span aria-hidden="true" className="ml-1.5">
            →
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-5 shadow-card ${
        out ? "border-red-200 bg-red-50" : "border-hs-line bg-white"
      }`}
    >
      <p className="text-sm font-semibold text-hs-ink">Your alert credits</p>
      <p className="mt-2 text-sm leading-relaxed text-hs-muted">
        Each credit sends one SMS when claimable tasks show up. New accounts
        start with 5 free credits. When you run out, alerts pause until you buy
        more.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p
          className={`inline-flex items-center rounded-full border px-4 py-2 text-base font-semibold tracking-tight tabular-nums ${
            out
              ? "border-red-300 bg-white text-red-700"
              : "border-hs-line bg-hs-bg text-hs-ink"
          }`}
        >
          {balance === null
            ? "…"
            : `${balance} credit${balance === 1 ? "" : "s"} left`}
        </p>
        <Link href="/credits/" className="btn-primary-sm">
          {out ? "Buy credits" : "Buy more credits"}
          <span aria-hidden="true" className="ml-1.5">
            →
          </span>
        </Link>
      </div>
      {out ? (
        <p className="mt-3 text-sm font-semibold text-red-700">
          You won’t get any more alerts until you buy more credits.
        </p>
      ) : null}
    </div>
  );
}
