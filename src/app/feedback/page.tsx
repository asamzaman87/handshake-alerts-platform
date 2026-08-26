"use client";

import { FormEvent, useState } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import { api } from "@/lib/api";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDone(false);
    const trimmed = feedback.trim();
    if (!trimmed) {
      setError("Please enter your feedback.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/handshake/feedback", {
        method: "POST",
        body: JSON.stringify({
          feedback: trimmed,
          email: email.trim() || undefined,
        }),
      });
      setFeedback("");
      setEmail("");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send feedback");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MarketingShell active="feedback">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="section-heading">Give feedback</h1>
        <p className="section-lede mt-4">
          Tell us what’s working, what’s confusing, or what you’d like us to
          add. We read every submission.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-hs-line bg-white p-6 shadow-card"
        >
          <label className="block">
            <span className="text-sm font-semibold text-hs-ink">Feedback</span>
            <textarea
              className="mt-2 min-h-[160px] w-full rounded-xl border border-hs-line bg-hs-bg px-4 py-3 text-sm text-hs-ink outline-none ring-hs-dark focus:ring-2"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts…"
              maxLength={5000}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-hs-ink">
              Email <span className="font-normal text-hs-muted">(optional)</span>
            </span>
            <input
              type="email"
              className="mt-2 w-full rounded-xl border border-hs-line bg-hs-bg px-4 py-3 text-sm text-hs-ink outline-none ring-hs-dark focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="so we can follow up if needed"
              disabled={busy}
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {done ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Thanks — your feedback was sent.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || !feedback.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {busy ? "Sending…" : "Submit feedback"}
          </button>
        </form>
      </div>
    </MarketingShell>
  );
}
