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
      <h1 className="mt-4 text-2xl font-semibold">Sign in with your phone</h1>
      <p className="mt-2 text-sm text-zinc-600">
        We will text you a 6-digit code. No email required.
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
