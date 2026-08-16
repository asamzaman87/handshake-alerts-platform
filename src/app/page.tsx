import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        Handshake Alerts
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Get a text when Handshake tasks show up.
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600">
        Sign in with your phone, add project IDs, and turn alerts on. We check
        about every 10 minutes. You choose how many texts you get, then we stop
        until you turn alerts back on.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/sign-in"
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-white"
        >
          Manage projects
        </Link>
      </div>
    </main>
  );
}
