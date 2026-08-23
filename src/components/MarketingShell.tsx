import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function MarketingShell({
  children,
  active,
  showSignIn = true,
}: {
  children: React.ReactNode;
  active?: "home" | "how" | "faq" | "contact";
  showSignIn?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-hs-bg">
      <SiteHeader active={active} showSignIn={showSignIn} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
