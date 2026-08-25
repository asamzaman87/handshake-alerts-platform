import { ConditionalFooter } from "./ConditionalFooter";
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
      <ConditionalFooter />
    </div>
  );
}
