import Link from "next/link";

export function CreditsBanner({ credits }: { credits: number | null }) {
  const balance = credits ?? null;
  const out = balance !== null && balance <= 0;

  return (
    <div
      className={`rounded-2xl border p-5 shadow-card ${
        out ? "border-amber-200 bg-amber-50" : "border-hs-line bg-white"
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
              ? "border-amber-300 bg-white text-amber-950"
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
        <p className="mt-3 text-sm font-medium text-amber-950">
          You’re out of credits — alerts won’t send until you top up.
        </p>
      ) : null}
    </div>
  );
}
