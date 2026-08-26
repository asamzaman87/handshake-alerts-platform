"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/api";

type NavKey =
  | "home"
  | "how"
  | "faq"
  | "contact"
  | "dashboard"
  | "feedback"
  | "credits";

export function SiteHeader({ active }: { active?: NavKey }) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(!!getToken());
  }, []);

  const linkClass = (key: NavKey) =>
    key === active
      ? "font-semibold text-hs-ink"
      : "text-hs-muted transition hover:text-hs-ink";

  function signOut() {
    clearToken();
    setSignedIn(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hs-line/80 bg-hs-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hs-dark text-xs font-bold text-hs-accent"
          >
            HA
          </span>
          <span className="truncate text-lg font-semibold tracking-tight text-hs-ink">
            Handshake <span className="font-medium text-hs-muted">Alerts</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {signedIn ? (
            <Link href="/dashboard/" className={linkClass("dashboard")}>
              Dashboard
            </Link>
          ) : null}
          {signedIn ? (
            <Link href="/credits/" className={linkClass("credits")}>
              Credits
            </Link>
          ) : null}
          <Link href="/how-it-works/" className={linkClass("how")}>
            How it works
          </Link>
          <Link href="/faq/" className={linkClass("faq")}>
            FAQ
          </Link>
          <Link href="/feedback/" className={linkClass("feedback")}>
            Give feedback
          </Link>
          <Link href="/contact/" className={linkClass("contact")}>
            Contact
          </Link>
        </nav>
        {signedIn ? (
          <button type="button" onClick={signOut} className="btn-primary-sm shrink-0">
            Sign out
          </button>
        ) : (
          <Link href="/sign-in/" className="btn-primary-sm shrink-0">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
