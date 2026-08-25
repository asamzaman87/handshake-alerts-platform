"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { api, setToken } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/handshake/auth/start", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api<{ token: string }>("/api/handshake/auth/verify", {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      });
      setToken(data.token);
      router.push("/dashboard/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MarketingShell>
      <div className="mx-auto flex max-w-lg flex-col px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-hs-muted hover:text-hs-ink"
        >
          <span aria-hidden="true">&larr;</span>
          Back
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Sign in with your phone
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-hs-muted">
          Enter your phone number to access Handshake Alerts. After you enable a
          project, we send account notification texts when that Handshake AI
          project has claimable tasks.
        </p>

        <div className="mt-8 rounded-2xl border border-hs-line bg-white p-6 shadow-card">
          {step === "phone" ? (
            <form onSubmit={sendCode} className="space-y-4">
              <label className="block text-sm font-semibold text-hs-ink">
                Phone number
                <input
                  className="mt-2 w-full rounded-xl border border-hs-line bg-hs-bg px-4 py-3 text-base outline-none ring-hs-dark focus:ring-2"
                  placeholder="+1 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs leading-relaxed text-hs-muted">
                By entering your phone number and tapping Continue, you agree to
                receive account notification SMS from Handshake Alerts at the
                number you provide when Handshake AI projects you enable have
                claimable tasks. Message frequency varies (typically a few texts
                per week per project you enable). Message and data rates may
                apply. Reply STOP to opt out, HELP for help. See our{" "}
                <Link href="/privacy/" className="underline underline-offset-2">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms/" className="underline underline-offset-2">
                  Terms
                </Link>
                .
              </p>
              <button disabled={busy} className="btn-primary w-full disabled:opacity-50">
                {busy ? "Sending…" : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <p className="text-sm text-hs-muted">Code sent to {phone}.</p>
              <label className="block text-sm font-semibold text-hs-ink">
                Verification code
                <input
                  className="mt-2 w-full rounded-xl border border-hs-line bg-hs-bg px-4 py-3 tracking-widest outline-none ring-hs-dark focus:ring-2"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={busy} className="btn-primary w-full disabled:opacity-50">
                {busy ? "Checking…" : "Verify and continue"}
              </button>
              <button
                type="button"
                className="w-full text-sm text-hs-muted hover:text-hs-ink"
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setError("");
                }}
              >
                Use a different number
              </button>
            </form>
          )}
        </div>
      </div>
    </MarketingShell>
  );
}
