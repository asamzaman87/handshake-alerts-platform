import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
        <span aria-hidden="true">&larr;</span> Back
      </Link>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Handshake Alerts
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Contact</h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-600">
        <p>
          Handshake Alerts is operated by Asam Zaman, doing business as Handshake
          Alerts. We provide SMS notifications when Handshake AI projects you
          enable have claimable tasks.
        </p>
        <p>
          Email:{" "}
          <a href="mailto:az1926@nyu.edu" className="underline underline-offset-2">
            az1926@nyu.edu
          </a>
        </p>
        <p>
          For SMS help, reply HELP to any message from us, or email us. Reply STOP
          to opt out.
        </p>
      </div>
    </main>
  );
}
