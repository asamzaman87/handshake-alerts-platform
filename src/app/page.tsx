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
        Sign in with your phone, add projects, and turn alerts on. We check
        about every 10 minutes. You choose how many texts you get, then we stop
        until you turn alerts back on.
      </p>
      <Link
        href="/sign-in"
        className="mt-10 inline-flex min-w-56 items-center justify-center rounded-xl bg-zinc-900 px-10 py-3.5 text-base font-medium text-white hover:bg-zinc-800"
      >
        Sign in
      </Link>
    </main>
  );
}
