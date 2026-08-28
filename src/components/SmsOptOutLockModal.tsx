"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ALERT_FROM_NUMBER,
  ALERT_FROM_NUMBER_DISPLAY,
} from "@/lib/constants";

type Props = {
  onResumed: () => void;
};

/** Blocking modal while the user has replied STOP. Clears after Twilio START is received. */
export function SmsOptOutLockModal({ onResumed }: Props) {
  const [copied, setCopied] = useState(false);
  const restartHref = `sms:${ALERT_FROM_NUMBER}?body=${encodeURIComponent("START")}`;

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await api<{ user: { smsOptedOut?: boolean } }>(
          "/api/handshake/me"
        );
        if (!cancelled && !data.user.smsOptedOut) {
          onResumed();
        }
      } catch {
        // ignore transient errors while polling
      }
    }

    void poll();
    const id = window.setInterval(poll, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [onResumed]);

  async function copyRestartInstructions() {
    const text = `Text START to ${ALERT_FROM_NUMBER_DISPLAY} to resume Handshake Alerts messages.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="sms-opt-out-title"
      aria-describedby="sms-opt-out-desc"
    >
      <div className="absolute inset-0 bg-hs-dark/55 backdrop-blur-sm" />
      <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-3xl border border-amber-200 bg-white p-7 shadow-card">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-amber-500" />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-800">
          Messages paused
        </p>
        <h2
          id="sms-opt-out-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-hs-ink"
        >
          You replied STOP
        </h2>
        <p
          id="sms-opt-out-desc"
          className="mt-3 text-sm leading-relaxed text-hs-muted"
        >
          We can&apos;t send alert texts while you&apos;re opted out, and the
          dashboard stays locked until you restart messages. Your alert settings
          are saved — they&apos;ll pick back up once you text START.
        </p>
        <p className="mt-3 text-sm font-semibold text-amber-900">
          Text START to {ALERT_FROM_NUMBER_DISPLAY} to resume alerts.
        </p>
        <a href={restartHref} className="btn-primary mt-6 flex w-full text-center">
          Restart messages
          <span aria-hidden="true" className="ml-1.5">
            →
          </span>
        </a>
        <button
          type="button"
          className="mt-3 w-full rounded-full border border-hs-line bg-white px-4 py-2.5 text-sm font-semibold text-hs-ink transition hover:bg-hs-bg"
          onClick={() => void copyRestartInstructions()}
        >
          {copied ? "Copied instructions" : "Copy restart instructions"}
        </button>
      </div>
    </div>
  );
}
