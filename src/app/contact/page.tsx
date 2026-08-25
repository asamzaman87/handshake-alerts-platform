import { AuthAppLink } from "@/components/AuthAppLink";
import { MarketingShell } from "@/components/MarketingShell";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <MarketingShell active="contact">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="section-heading">Contact</h1>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-hs-muted">
          <p>
            Handshake Alerts provides SMS notifications when Handshake AI
            projects you enable have claimable tasks.
          </p>
          <p>
            Email:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-hs-ink underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            For SMS help, reply HELP to any message from us, or email us. Reply
            STOP to opt out.
          </p>
        </div>
        <AuthAppLink
          signedOutLabel="Sign in to the app"
          signedInLabel="Open dashboard"
          className="btn-primary mt-10"
        />
      </div>
    </MarketingShell>
  );
}
