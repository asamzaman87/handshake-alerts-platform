import Link from "next/link";
import { AuthAppLink } from "@/components/AuthAppLink";
import { MarketingShell } from "@/components/MarketingShell";
import { ProductPreview } from "@/components/ProductPreview";

export const metadata = {
  title: "How it works",
};

export default function HowItWorksPage() {
  return (
    <MarketingShell active="how">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="section-heading">How Handshake Alerts works</h1>
        <p className="section-lede max-w-3xl">
          Handshake Alerts watches Handshake AI projects you add and sends SMS
          when claimable tasks are available. You stay in control of which
          projects are monitored and how often we text you.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
          <ol className="space-y-8">
            <li className="rounded-2xl border border-hs-line bg-white p-6">
              <p className="text-sm font-semibold text-hs-accent">Step 1</p>
              <h2 className="mt-2 text-xl font-semibold">Sign in with your phone</h2>
              <p className="mt-2 text-sm leading-relaxed text-hs-muted">
                Enter your number on the sign-in page and agree to receive
                account notification SMS about claimable tasks on projects you
                enable.
              </p>
            </li>
            <li className="rounded-2xl border border-hs-line bg-white p-6">
              <p className="text-sm font-semibold text-hs-accent">Step 2</p>
              <h2 className="mt-2 text-xl font-semibold">Add project IDs</h2>
              <p className="mt-2 text-sm leading-relaxed text-hs-muted">
                Paste Handshake AI project UUIDs into your dashboard. Each
                project has its own alert settings: on/off, max alerts, and
                cooldown hours.
              </p>
            </li>
            <li className="rounded-2xl border border-hs-line bg-white p-6">
              <p className="text-sm font-semibold text-hs-accent">Step 3</p>
              <h2 className="mt-2 text-xl font-semibold">Receive task alerts</h2>
              <p className="mt-2 text-sm leading-relaxed text-hs-muted">
                About every 10 minutes we check each enabled project. If more
                than two claimable tasks are waiting, we text you. After you hit
                your max alerts, we pause until the cooldown you set expires.
              </p>
            </li>
          </ol>
          <ProductPreview />
        </div>

        <div className="mt-12 rounded-2xl border border-hs-line bg-hs-bg p-6">
          <h2 className="text-lg font-semibold">Opt-in and consent</h2>
          <p className="mt-2 text-sm leading-relaxed text-hs-muted">
            By entering your phone number and tapping Continue on the sign-in
            page, you agree to receive account notification SMS from Handshake
            Alerts when Handshake AI projects you enable have claimable tasks.
            Message frequency varies. Message and data rates may apply. Reply
            STOP to opt out, HELP for help. See our{" "}
            <Link href="/privacy/" className="underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms/" className="underline underline-offset-2">
              Terms
            </Link>
            .
          </p>
          <AuthAppLink
            signedOutLabel="Go to sign in"
            hideWhenSignedIn
          />
        </div>
      </div>
    </MarketingShell>
  );
}
