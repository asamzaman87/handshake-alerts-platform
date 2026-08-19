import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
        <span aria-hidden="true">&larr;</span> Back
      </Link>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Handshake Alerts
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Terms</h1>
      <p className="mt-4 text-sm text-zinc-500">Last updated: August 18, 2026</p>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-600">
        <p>
          Handshake Alerts is operated by Asam Zaman (doing business as Handshake
          Alerts). Handshake Alerts texts you about Handshake AI claimable tasks
          for projects you add and enable. It is not affiliated with Handshake.
        </p>
        <p>
          By signing in with your phone, you consent to receive SMS from Handshake
          Alerts as described on the sign-in page. Message frequency varies.
          Message and data rates may apply. Reply STOP to unsubscribe, HELP for
          help.
        </p>
        <p>
          You are responsible for the Handshake project IDs you add. We check for
          claimable tasks on a schedule and send alerts only when your settings
          allow it.
        </p>
      </div>
    </main>
  );
}
