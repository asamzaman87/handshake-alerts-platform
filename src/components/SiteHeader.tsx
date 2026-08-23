import Link from "next/link";

export function SiteHeader({
  showSignIn = true,
  active,
}: {
  showSignIn?: boolean;
  active?: "home" | "how" | "faq" | "contact";
}) {
  const linkClass = (key: typeof active) =>
    key === active
      ? "font-semibold text-hs-ink"
      : "text-hs-muted transition hover:text-hs-ink";

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
          <Link href="/how-it-works/" className={linkClass("how")}>
            How it works
          </Link>
          <Link href="/faq/" className={linkClass("faq")}>
            FAQ
          </Link>
          <Link href="/contact/" className={linkClass("contact")}>
            Contact
          </Link>
        </nav>
        {showSignIn ? (
          <Link href="/sign-in/" className="btn-primary-sm shrink-0">
            Sign in
          </Link>
        ) : (
          <span className="w-[72px]" aria-hidden="true" />
        )}
      </div>
    </header>
  );
}
