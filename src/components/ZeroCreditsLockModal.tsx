"use client";

import Link from "next/link";

/** Blocking modal while the account has 0 alert credits. Only clears after balance > 0. */
export function ZeroCreditsLockModal() {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="zero-credits-title"
      aria-describedby="zero-credits-desc"
    >
      <div className="absolute inset-0 bg-hs-dark/50 backdrop-blur-sm" />
      <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-3xl border border-red-200 bg-white p-7 shadow-card">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-red-600" />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
          Out of credits
        </p>
        <h2
          id="zero-credits-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-hs-ink"
        >
          You have no alert credits left
        </h2>
        <p
          id="zero-credits-desc"
          className="mt-3 text-sm leading-relaxed text-hs-muted"
        >
          Without credits we can’t text you when claimable tasks show up, and
          your projects stay locked until you top up. Buy a credit pack to turn
          alerts back on.
        </p>
        <p className="mt-3 text-sm font-semibold text-red-700">
          You won’t get any more alerts until you buy more credits.
        </p>
        <Link href="/credits/" className="btn-primary mt-6 flex w-full text-center">
          Buy more credits
          <span aria-hidden="true" className="ml-1.5">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
