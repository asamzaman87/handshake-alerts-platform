import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="section-heading">Privacy Policy</h1>
        <p className="mt-4 text-sm text-hs-muted">Last updated: August 23, 2026</p>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-hs-muted">
          <p>
            Handshake Alerts is operated by Asam Zaman (doing business as
            Handshake Alerts). We collect your phone number when you sign in so
            we can send a one-time verification code and, if you enable a
            project, SMS alerts when Handshake AI claimable tasks are available.
          </p>
          <p>
            We also store the Handshake project IDs you add, your alert on/off
            preference, and how many alerts you asked us to send. We do not sell
            your phone number or project list. We use Twilio to deliver SMS.
          </p>
          <p>
            You can stop SMS at any time by replying STOP or by turning alerts
            off or deleting a project in the app. For questions, email{" "}
            <a href="mailto:az1926@nyu.edu" className="text-hs-ink underline">
              az1926@nyu.edu
            </a>
            .
          </p>
        </div>
        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-hs-ink underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    </MarketingShell>
  );
}
