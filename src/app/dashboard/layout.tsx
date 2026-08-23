import { SiteHeader } from "@/components/SiteHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-hs-bg">
      <SiteHeader showSignIn={false} />
      {children}
    </div>
  );
}
