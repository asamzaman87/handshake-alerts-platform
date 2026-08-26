"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketingShell } from "@/components/MarketingShell";
import { api, getToken } from "@/lib/api";

type Pack = {
  slug: string;
  credits: number;
  amountCents: number;
  label: string;
  priceLabel: string;
  priceId: string;
};

export default function CreditsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [buyingSlug, setBuyingSlug] = useState<string | null>(null);

  async function load() {
    const data = await api<{
      user: { alertCredits: number };
      packs: Pack[];
    }>("/api/handshake/me");
    setCredits(data.user.alertCredits);
    setPacks(data.packs);
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace("/sign-in/");
      return;
    }
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setNotice("Payment received. Your credits will appear in a few seconds.");
    } else if (checkout === "cancel") {
      setNotice("Checkout canceled — no charge was made.");
    }
    load()
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load credits");
      })
      .finally(() => setReady(true));
  }, [router, searchParams]);

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    const id = window.setTimeout(() => {
      load().catch(() => undefined);
    }, 1500);
    return () => window.clearTimeout(id);
  }, [searchParams]);

  async function buy(pack: Pack) {
    setError("");
    setBuyingSlug(pack.slug);
    try {
      const data = await api<{ url: string }>("/api/handshake/credits/checkout", {
        method: "POST",
        body: JSON.stringify({
          slug: pack.slug,
          successUrl: "https://handshakealerts.com/credits/?checkout=success",
          cancelUrl: "https://handshakealerts.com/credits/?checkout=cancel",
        }),
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBuyingSlug(null);
    }
  }

  if (!ready) {
    return (
      <MarketingShell active="credits">
        <main className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-hs-muted">
          Loading credits…
        </main>
      </MarketingShell>
    );
  }

  const outOfCredits = credits !== null && credits <= 0;

  return (
    <MarketingShell active="credits">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hs-muted">
          Credits
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-hs-ink md:text-4xl">
          Buy alert credits
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-hs-muted">
          Each credit sends one SMS alert when claimable tasks show up. New
          accounts start with 5 free credits.
        </p>

        <div
          className={`relative mt-8 overflow-hidden rounded-2xl border p-6 shadow-card ${
            outOfCredits
              ? "border-red-200 bg-red-50"
              : "border-hs-line bg-white"
          }`}
        >
          {outOfCredits ? (
            <div className="absolute inset-x-0 top-0 h-1.5 bg-red-600" />
          ) : null}
          <p
            className={`text-sm font-semibold uppercase tracking-[0.14em] ${
              outOfCredits ? "text-red-700" : "text-hs-muted"
            }`}
          >
            {outOfCredits ? "Out of credits" : "Your balance"}
          </p>
          <p
            className={`mt-2 text-4xl font-semibold tabular-nums ${
              outOfCredits ? "text-red-700" : "text-hs-ink"
            }`}
          >
            {credits ?? "—"}
          </p>
          <p
            className={`mt-1 text-sm ${
              outOfCredits ? "text-red-700/80" : "text-hs-muted"
            }`}
          >
            credit{(credits ?? 0) === 1 ? "" : "s"} remaining
          </p>
          {outOfCredits ? (
            <p className="mt-4 text-sm font-semibold leading-relaxed text-red-700">
              You won’t get any more alerts until you buy more credits.
            </p>
          ) : null}
        </div>

        {notice ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {packs.map((pack) => (
            <div
              key={pack.slug}
              className="flex flex-col rounded-2xl border border-hs-line bg-white p-6 shadow-card"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-hs-muted">
                {pack.slug}
              </p>
              <p className="mt-2 text-2xl font-semibold text-hs-ink">
                {pack.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-hs-ink">
                {pack.priceLabel}
              </p>
              <p className="mt-2 text-sm text-hs-muted">
                ≈ ${(pack.amountCents / 100 / pack.credits).toFixed(2)} per
                alert
              </p>
              <button
                type="button"
                disabled={buyingSlug !== null}
                className="btn-primary mt-6 w-full disabled:opacity-50"
                onClick={() => buy(pack)}
              >
                {buyingSlug === pack.slug ? "Redirecting…" : "Buy"}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-hs-muted">
          Payments are processed securely by Stripe.{" "}
          <Link
            href="/dashboard/"
            className="font-semibold text-hs-ink underline-offset-2 hover:underline"
          >
            Back to dashboard
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
