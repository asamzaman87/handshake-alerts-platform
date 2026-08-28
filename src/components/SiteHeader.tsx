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

type NavItem = { key: NavKey; href: string; label: string; signedInOnly?: boolean };

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard/", label: "Dashboard", signedInOnly: true },
  { key: "credits", href: "/credits/", label: "Credits", signedInOnly: true },
  { key: "how", href: "/how-it-works/", label: "How it works" },
  { key: "faq", href: "/faq/", label: "FAQ" },
  { key: "feedback", href: "/feedback/", label: "Give feedback" },
  { key: "contact", href: "/contact/", label: "Contact" },
];

export function SiteHeader({ active }: { active?: NavKey }) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSignedIn(!!getToken());
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [active]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const linkClass = (key: NavKey) =>
    key === active
      ? "font-semibold text-hs-ink"
      : "text-hs-muted transition hover:text-hs-ink";

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.signedInOnly || signedIn
  );

  function signOut() {
    clearToken();
    setSignedIn(false);
    setMenuOpen(false);
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
          {visibleItems.map((item) => (
            <Link key={item.key} href={item.href} className={linkClass(item.key)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hs-line text-hs-ink md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-site-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          {signedIn ? (
            <button type="button" onClick={signOut} className="btn-primary-sm">
              Sign out
            </button>
          ) : (
            <Link href="/sign-in/" className="btn-primary-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-site-nav"
          className="border-t border-hs-line bg-hs-bg px-6 py-4 md:hidden"
        >
          <ul className="space-y-1 text-sm">
            {visibleItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`block rounded-xl px-3 py-2.5 ${linkClass(item.key)}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
