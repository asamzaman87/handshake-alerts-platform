import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { ProductPreview } from "@/components/ProductPreview";
import { SignedInRedirect } from "@/components/SignedInRedirect";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

const STEPS = [
  {
    title: "Sign in with your phone",
    body: "Enter your number and agree to account notification SMS.",
  },
  {
    title: "Add Handshake project IDs",
    body: "Paste the UUIDs for the AI projects you want to watch.",
  },
  {
    title: "Get texts when tasks show up",
    body: "We check about every 10 minutes and text you when more than two tasks are waiting.",
  },
];

export default function HomePage() {
  return (
    <MarketingShell active="home">
      <SignedInRedirect />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(211,251,82,0.18),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(122,243,255,0.12),_transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hs-muted">
              Handshake Alerts
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-hs-ink md:text-5xl">
              Get a text when Handshake tasks show up.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-hs-muted">
              {SITE_DESCRIPTION} Turn alerts on per project, set limits you
              control, and get notified when claimable tasks are waiting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-in/" className="btn-accent">
                Sign in
              </Link>
              <Link
                href="/how-it-works/"
                className="inline-flex items-center justify-center rounded-full border border-hs-line bg-white px-6 py-3 text-sm font-semibold text-hs-ink transition hover:border-hs-ink"
              >
                How it works
              </Link>
            </div>
            <p className="mt-6 text-sm text-hs-muted">
              Not affiliated with Handshake
            </p>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-y border-hs-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="section-heading text-center">How it works</h2>
          <p className="section-lede mx-auto max-w-2xl text-center">
            Three steps from sign-in to your first alert.
          </p>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-hs-line bg-hs-bg p-6"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-hs-dark text-sm font-bold text-hs-accent">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-hs-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-hs-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="section-heading">Built for Handshake AI workflows</h2>
            <p className="section-lede">
              You choose which projects to watch, how many texts to receive, and
              how long to pause after the cap. Alerts are account notifications,
              not marketing blasts.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-hs-muted">
              <li>Checks run about every 10 minutes per project</li>
              <li>Texts send when more than two claimable tasks are waiting</li>
              <li>Reply STOP to opt out · HELP for support</li>
            </ul>
            <Link href="/faq/" className="mt-6 inline-block text-sm font-semibold text-hs-ink underline-offset-4 hover:underline">
              Read the FAQ
            </Link>
          </div>
          <div className="rounded-2xl bg-hs-dark p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-hs-accent">
              What you&apos;ll see
            </p>
            <p className="mt-3 text-2xl font-semibold leading-snug">
              A dashboard to manage alerts per project.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Toggle alerts on or off, refresh task counts, set max alerts and
              cooldown hours, and delete projects you no longer need.
            </p>
            <Link
              href="/sign-in/"
              className="mt-6 inline-flex rounded-full bg-hs-accent px-5 py-2.5 text-sm font-semibold text-hs-dark"
            >
              Open the app
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-hs-dark px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Ready to get notified?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/70">
          Sign in with your phone, add a project ID, and turn alerts on.
        </p>
        <Link href="/sign-in/" className="btn-accent mt-8">
          Sign in
        </Link>
      </section>
    </MarketingShell>
  );
}
