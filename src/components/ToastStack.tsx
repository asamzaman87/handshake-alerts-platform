"use client";

import { useEffect, useState } from "react";

export type ToastItem = {
  id: string;
  message: string;
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          id={toast.id}
          message={toast.message}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

function ToastCard({
  id,
  message,
  onDismiss,
}: {
  id: string;
  message: string;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = window.requestAnimationFrame(() => setVisible(true));
    const hideAt = window.setTimeout(() => setVisible(false), 4500);
    const removeAt = window.setTimeout(() => onDismiss(id), 4700);
    return () => {
      window.cancelAnimationFrame(show);
      window.clearTimeout(hideAt);
      window.clearTimeout(removeAt);
    };
    // Intentionally run once per toast mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div
      role="status"
      className={`pointer-events-auto rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm leading-snug text-hs-ink shadow-card transition duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1">{message}</p>
        <button
          type="button"
          aria-label="Dismiss"
          className="shrink-0 text-hs-muted transition hover:text-hs-ink"
          onClick={() => onDismiss(id)}
        >
          ×
        </button>
      </div>
    </div>
  );
}
