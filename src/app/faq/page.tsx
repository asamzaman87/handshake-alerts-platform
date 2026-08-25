import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export const metadata = {
  title: "FAQ",
};

const FAQ = [
  {
    q: "What is Handshake Alerts?",
    a: "Handshake Alerts is a notification service that texts you when Handshake AI projects you add have more than two claimable tasks waiting.",
  },
  {
    q: "Is this affiliated with Handshake?",
    a: "No. Handshake Alerts is an independent tool and is not affiliated with Handshake.",
  },
  {
    q: "How often do you check for tasks?",
    a: "About every 10 minutes for each project you have enabled.",
  },
  {
    q: "When will I get a text?",
    a: "When we find more than two claimable tasks on a project where alerts are on and you still have alerts remaining before your cooldown.",
  },
  {
    q: "How do I stop texts?",
    a: "Reply STOP to any message, turn alerts off for a project in your dashboard, delete the project, or sign out.",
  },
  {
    q: "What kinds of texts will I get?",
    a: "Account notification texts when Handshake AI projects you enable have claimable tasks. These are not marketing messages.",
  },
];

export default function FaqPage() {
  return (
    <MarketingShell active="faq">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="section-heading">Frequently asked questions</h1>
        <p className="section-lede">
          Common questions about alerts, consent, and how the service works.
        </p>
        <dl className="mt-10 space-y-4">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-hs-line bg-white p-6"
            >
              <dt className="text-lg font-semibold text-hs-ink">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-hs-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm text-hs-muted">
          Still have questions?{" "}
          <Link href="/contact/" className="font-semibold text-hs-ink underline-offset-4 hover:underline">
            Contact us
          </Link>
          .
        </p>
      </div>
    </MarketingShell>
  );
}
