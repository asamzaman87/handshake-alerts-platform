import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
        <span aria-hidden="true">&larr;</span> Back
      </Link>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Handshake Alerts
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-zinc-500">Last updated: August 18, 2026</p>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-600">
        <p>
          Handshake Alerts is operated by Asam Zaman (doing business as Handshake
          Alerts). We collect your phone number when you sign in so we can send a
          one-time verification code and, if you enable a project, SMS alerts when
          Handshake AI claimable tasks are available.
        </p>
        <p>
          We also store the Handshake project IDs you add, your alert on/off
          preference, and how many alerts you asked us to send. We do not sell
          your phone number or project list. We use Twilio to deliver SMS.
        </p>
        <p>
          You can stop SMS at any time by replying STOP or by turning alerts off
          or deleting a project in the app. For questions, email az1926@nyu.edu.
        </p>
      </div>
    </main>
  );
}
