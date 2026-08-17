"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <span aria-hidden="true">&larr;</span>
        Back
      </Link>
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Handshake Alerts
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Sign in with your phone</h1>
      <p className="mt-2 text-sm text-zinc-600">
        We will text you a 6-digit sign-in code. After you sign in, Handshake
        Alerts can text you when Handshake AI projects you enable have claimable
        tasks.
      </p>

      {step === "phone" ? (
        <form onSubmit={sendCode} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Phone number
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs leading-relaxed text-zinc-500">
            By entering your phone number and tapping Send code, you agree to
            receive SMS from Handshake Alerts at the number you provide.
            Messages include a one-time sign-in code and, after you enable a
            project, account notifications when that Handshake project has
            claimable tasks. Message frequency varies (typically a few texts per
            week per project you enable). Message and data rates may apply.
            Reply STOP to opt out, HELP for help. See our{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms
            </Link>
            .
          </p>
          <button
            disabled={busy}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-6 space-y-4">
          <p className="text-sm text-zinc-600">Code sent to {phone}.</p>
          <label className="block text-sm font-medium">
            Verification code
            <input
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={busy}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "Checking…" : "Verify and continue"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-zinc-500"
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
    </main>
  );
}
