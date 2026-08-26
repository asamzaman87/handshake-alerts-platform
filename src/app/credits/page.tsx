import { Suspense } from "react";
import CreditsClient from "./CreditsClient";

export default function CreditsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-hs-muted">
          Loading credits…
        </main>
      }
    >
      <CreditsClient />
    </Suspense>
  );
}
