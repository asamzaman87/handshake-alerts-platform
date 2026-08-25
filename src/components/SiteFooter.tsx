import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-hs-line bg-hs-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold">Handshake Alerts</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            SMS notifications when Handshake AI projects you follow have
            claimable tasks. Not affiliated with Handshake.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Product
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/dashboard/" className="hover:text-hs-accent">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/how-it-works/" className="hover:text-hs-accent">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/faq/" className="hover:text-hs-accent">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/sign-in/" className="hover:text-hs-accent">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Legal
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/privacy/" className="hover:text-hs-accent">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms/" className="hover:text-hs-accent">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/contact/" className="hover:text-hs-accent">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Handshake Alerts. All rights reserved.
      </div>
    </footer>
  );
}
