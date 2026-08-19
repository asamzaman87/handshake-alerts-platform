"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
      return;
    }
    setShow(true);
  }, [router]);

  if (!show) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Loading…
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        Handshake Alerts
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Get a text when Handshake tasks show up.
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600">
        Handshake Alerts is a small notification service operated by Asam Zaman.
        Sign in with your phone and add the Handshake AI projects you care
        about. About every 10 minutes we check each project for claimable tasks.
        If we find more than two waiting, we text you. You choose how many of
        those texts to get; after that we pause texting for that project for the
        cooldown you set, then start again.
      </p>
      <Link
        href="/sign-in"
        className="mt-10 inline-flex min-w-56 items-center justify-center rounded-xl bg-zinc-900 px-10 py-3.5 text-base font-medium text-white hover:bg-zinc-800"
      >
        Sign in
      </Link>
      <p className="mt-6 text-sm text-zinc-500">
        <Link href="/privacy" className="underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/terms" className="underline-offset-2 hover:underline">
          Terms
        </Link>
        {" · "}
        <Link href="/contact" className="underline-offset-2 hover:underline">
          Contact
        </Link>
      </p>
    </main>
  );
}
