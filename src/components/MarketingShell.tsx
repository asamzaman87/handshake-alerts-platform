import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function MarketingShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "home" | "how" | "faq" | "contact" | "dashboard";
}) {
  return (
    <div className="flex min-h-screen flex-col bg-hs-bg">
      <SiteHeader active={active} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
