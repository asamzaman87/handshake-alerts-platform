import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-hs-bg">
      <SiteHeader active="dashboard" />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
