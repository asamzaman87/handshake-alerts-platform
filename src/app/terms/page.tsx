import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export const metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="section-heading">Terms</h1>
        <p className="mt-4 text-sm text-hs-muted">Last updated: August 24, 2026</p>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-hs-muted">
          <p>
            Handshake Alerts is operated by Asam Zaman (doing business as
            Handshake Alerts). Handshake Alerts sends account notification SMS
            about Handshake AI claimable tasks for projects you add and enable.
            It is not affiliated with Handshake.
          </p>
          <p>
            By signing in with your phone, you consent to receive account
            notification SMS from Handshake Alerts as described on the sign-in
            page. Message frequency varies. Message and data rates may apply.
            Reply STOP to unsubscribe, HELP for help.
          </p>
          <p>
            You are responsible for the Handshake project IDs you add. We check
            for claimable tasks on a schedule and send alerts only when your
            settings allow it.
          </p>
        </div>
        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-hs-ink underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    </MarketingShell>
  );
}
