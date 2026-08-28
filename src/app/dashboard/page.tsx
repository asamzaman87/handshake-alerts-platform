"use client";

import { FormEvent, ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertNumberBanner } from "@/components/AlertNumberBanner";
import { CreditsBanner } from "@/components/CreditsBanner";
import { WelcomeCreditsModal } from "@/components/WelcomeCreditsModal";
import { ZeroCreditsLockModal } from "@/components/ZeroCreditsLockModal";
import { SmsOptOutLockModal } from "@/components/SmsOptOutLockModal";
import { ToastStack, type ToastItem } from "@/components/ToastStack";
import {
  api,
  CHECK_INTERVAL_OPTIONS,
  COOLDOWN_INTERVAL_OPTIONS,
  clearToken,
  formatCheckInterval,
  formatCooldownInterval,
  getToken,
  type Project,
} from "@/lib/api";
import { TEST_MODE, TEST_MODE_TASK_COUNT } from "@/lib/constants";

const DEFAULT_CHECK_INTERVAL = 10;
const DEFAULT_ALERT_COOLDOWN = 30;
/** User balance + SMS opt-out while dashboard is open. */
const ME_POLL_MS = 8_000;
/** Project last-check and task counts while dashboard is open. */
const PROJECTS_POLL_MS = 30_000;

const HINTS = {
  projectId:
    "The Handshake project UUID from the project page. The video above shows where to copy it.",
  checkInterval:
    "How often we look for claimable tasks on this project. Times are approximate.",
  alertCooldown:
    "After we text you about available tasks, we can pause checking for a while. Choose “No pause” to keep checking on your normal schedule with no cooldown.",
};

function isProjectIdAddError(message: string) {
  return /project|uuid|already added|inaccessible|invalid/i.test(message);
}

const TOOLTIP_WIDTH = 224; // w-56
const TOOLTIP_GAP = 8;
const VIEWPORT_PAD = 12;

function FieldHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | null>(null);

  function clearCloseTimer() {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function show() {
    clearCloseTimer();
    setOpen(true);
  }

  function hideSoon() {
    if (pinned) return;
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, 120);
  }

  function placeTooltip() {
    const button = wrapRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const tipHeight = tipRef.current?.offsetHeight ?? 120;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
    const placeAbove =
      spaceBelow < tipHeight + TOOLTIP_GAP && rect.top > tipHeight + TOOLTIP_GAP;

    let left = rect.left;
    left = Math.min(left, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_PAD);
    left = Math.max(VIEWPORT_PAD, left);

    const top = placeAbove
      ? rect.top - tipHeight - TOOLTIP_GAP
      : rect.bottom + TOOLTIP_GAP;

    setCoords({ top, left });
  }

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    placeTooltip();
    const id = window.requestAnimationFrame(() => placeTooltip());
    return () => window.cancelAnimationFrame(id);
  }, [open, text]);

  useEffect(() => {
    if (!open) return;
    function onReposition() {
      placeTooltip();
    }
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!pinned) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        wrapRef.current?.contains(target) ||
        tipRef.current?.contains(target)
      ) {
        return;
      }
      setPinned(false);
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPinned(false);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pinned]);

  return (
    <span ref={wrapRef} className="relative ml-0.5 inline-flex">
      <button
        type="button"
        aria-label="More information"
        aria-expanded={open}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-hs-muted text-[10px] font-medium leading-none text-hs-muted hover:bg-hs-bg"
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          clearCloseTimer();
          setPinned((current) => {
            const next = !current;
            setOpen(next);
            return next;
          });
        }}
      >
        ?
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <span
              ref={tipRef}
              role="tooltip"
              className="fixed z-[80] w-56 rounded-xl border border-hs-line bg-white p-3 text-left text-xs font-normal leading-snug text-hs-muted shadow-card"
              style={{
                top: coords?.top ?? -9999,
                left: coords?.left ?? -9999,
                visibility: coords ? "visible" : "hidden",
              }}
              onMouseEnter={show}
              onMouseLeave={hideSoon}
            >
              {text}
            </span>,
            document.body
          )
        : null}
    </span>
  );
}

function OutlinedField({
  label,
  hint,
  muted = false,
  invalid = false,
  children,
}: {
  label: string;
  hint?: string;
  muted?: boolean;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset
      className={`relative min-w-0 rounded-md border px-3 pb-1.5 pt-0.5 ${
        invalid
            ? "border-red-600 text-red-600"
          : muted
            ? "border-hs-line text-hs-muted"
            : "border-hs-dark text-hs-ink"
      }`}
    >
      <legend className="inline-flex items-center px-1 text-[13px] leading-none">
        {label}
        {hint ? <FieldHint text={hint} /> : null}
      </legend>
      {children}
    </fieldset>
  );
}

function AlertsToggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? "Alert on" : "Alert off"}
      onClick={onToggle}
      className="inline-flex items-center gap-2 text-sm"
    >
      <span className="text-hs-muted">Alert</span>
      <span
        className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
          on ? "bg-hs-dark" : "bg-hs-line"
        }`}
      >
        <span
          className={`pointer-events-none absolute text-[11px] font-medium ${
            on ? "left-1.5 text-white" : "right-1.5 text-hs-muted"
          }`}
        >
          {on ? "On" : "Off"}
        </span>
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
            on ? "left-[1.7rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function MessageModal({
  title,
  message,
  onClose,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  onClose: () => void;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hs-dark/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-hs-line bg-white p-6 shadow-card">
        <p className="text-lg font-semibold text-hs-ink">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-hs-muted">{message}</p>
        <div className="mt-5 flex flex-col gap-2">
          {actionHref && actionLabel ? (
            <Link href={actionHref} className="btn-primary w-full text-center" onClick={onClose}>
              {actionLabel}
            </Link>
          ) : null}
          <button
            type="button"
            className={
              actionHref
                ? "w-full rounded-full border border-hs-line bg-white px-4 py-2.5 text-sm font-semibold text-hs-ink transition hover:bg-hs-bg"
                : "btn-primary w-full"
            }
            onClick={onClose}
          >
            {actionHref ? "Not now" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hs-dark/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-hs-line bg-white p-6 shadow-card">
        <p className="text-lg font-semibold text-hs-ink">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-hs-muted">{message}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-full border border-hs-line px-4 py-2.5 text-sm font-semibold text-hs-ink transition hover:border-hs-ink"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 rounded-full bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function tasksFoundLabel(count: number) {
  if (count === 0) return "no tasks found";
  if (count === 1) return "1 task found";
  return `${count} tasks found`;
}

function cooldownRemainingLabel(iso: string, nowMs = Date.now()) {
  const ms = Math.max(0, new Date(iso).getTime() - nowMs);
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v6h6M20 20v-6h-6M5.3 9A7 7 0 0 1 19 8m-.3 7A7 7 0 0 1 5 16"
      />
    </svg>
  );
}
function RefreshButton({
  spinning,
  label,
  onClick,
}: {
  spinning: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={spinning}
      className="shrink-0 rounded border border-hs-dark p-1 text-hs-ink hover:bg-hs-bg disabled:opacity-50"
      onClick={onClick}
    >
      <RefreshIcon spinning={spinning} />
    </button>
  );
}
function CopyableProjectId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const resetRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetRef.current !== null) {
        window.clearTimeout(resetRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      if (resetRef.current !== null) {
        window.clearTimeout(resetRef.current);
      }
      resetRef.current = window.setTimeout(() => {
        setCopied(false);
        resetRef.current = null;
      }, 2000);
    } catch {
      // Clipboard may be unavailable in some browsers/contexts.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="group mt-1 flex w-full max-w-full items-center gap-2 rounded-md py-0.5 text-left transition hover:bg-white/60"
      aria-label={copied ? "Project ID copied" : "Copy project ID"}
    >
      <span className="min-w-0 truncate font-mono text-xs text-hs-muted">{id}</span>
      <span
        className={`shrink-0 font-sans text-[11px] font-semibold tracking-wide ${
          copied ? "text-emerald-700" : "text-hs-muted opacity-0 group-hover:opacity-100"
        }`}
      >
        {copied ? "Copied" : "Click to copy"}
      </span>
    </button>
  );
}

function ProjectCard({
  project,
  refreshingTasks,
  creditsLocked,
  onPatch,
  onRemove,
  onRefreshTasks,
  onRefreshStatus,
  onBlocked,
  onToast,
}: {
  project: Project;
  refreshingTasks: boolean;
  creditsLocked: boolean;
  onPatch: (
    id: string,
    body: Record<string, unknown>
  ) => Promise<{ project: Project }>;
  onRemove: (id: string) => Promise<void>;
  onRefreshTasks: (id: string) => void;
  onRefreshStatus: (id: string) => Promise<Project | null>;
  onBlocked: (blocked: {
    title: string;
    message: string;
    actionHref?: string;
    actionLabel?: string;
  }) => void;
  onToast: (message: string) => void;
}) {
  const [draftInterval, setDraftInterval] = useState(
    project.checkIntervalMinutes
  );
  const [draftCooldown, setDraftCooldown] = useState(
    project.alertCooldownMinutes
  );
  const [savingInterval, setSavingInterval] = useState(false);
  const [savingCooldown, setSavingCooldown] = useState(false);
  const [resettingCooldown, setResettingCooldown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setDraftInterval(project.checkIntervalMinutes);
  }, [project.checkIntervalMinutes]);

  useEffect(() => {
    setDraftCooldown(project.alertCooldownMinutes);
  }, [project.alertCooldownMinutes]);

  useEffect(() => {
    if (!project.onCooldown || !project.alertsCooldownUntil) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [project.onCooldown, project.alertsCooldownUntil]);

  useEffect(() => {
    if (!project.onCooldown || !project.alertsCooldownUntil) return;
    if (new Date(project.alertsCooldownUntil).getTime() > now) return;
    void onRefreshStatus(project.id).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when countdown expires
  }, [now, project.id, project.onCooldown, project.alertsCooldownUntil]);

  async function saveInterval(nextInterval: number) {
    if (nextInterval === project.checkIntervalMinutes) return;

    setSavingInterval(true);
    try {
      let fresh: Project | null;
      try {
        fresh = await onRefreshStatus(project.id);
      } catch (err) {
        setDraftInterval(project.checkIntervalMinutes);
        onBlocked({
          title: "Couldn’t refresh project",
          message:
            err instanceof Error
              ? err.message
              : "Check your connection and try again.",
        });
        return;
      }
      if (!fresh) {
        setDraftInterval(project.checkIntervalMinutes);
        onBlocked({
          title: "Project not found",
          message:
            "This project is no longer available. Refresh the page and try again.",
        });
        return;
      }

      if (nextInterval === fresh.checkIntervalMinutes) {
        setDraftInterval(fresh.checkIntervalMinutes);
        return;
      }

      await onPatch(project.id, { checkIntervalMinutes: nextInterval });
      const name = project.displayName || "Untitled project";
      onToast(`Check interval updated for ${name}.`);
    } catch {
      setDraftInterval(project.checkIntervalMinutes);
    } finally {
      setSavingInterval(false);
    }
  }

  async function saveCooldown(nextCooldown: number) {
    if (nextCooldown === project.alertCooldownMinutes) return;

    setSavingCooldown(true);
    try {
      let fresh: Project | null;
      try {
        fresh = await onRefreshStatus(project.id);
      } catch (err) {
        setDraftCooldown(project.alertCooldownMinutes);
        onBlocked({
          title: "Couldn’t refresh project",
          message:
            err instanceof Error
              ? err.message
              : "Check your connection and try again.",
        });
        return;
      }
      if (!fresh) {
        setDraftCooldown(project.alertCooldownMinutes);
        onBlocked({
          title: "Project not found",
          message:
            "This project is no longer available. Refresh the page and try again.",
        });
        return;
      }

      if (nextCooldown === fresh.alertCooldownMinutes) {
        setDraftCooldown(fresh.alertCooldownMinutes);
        return;
      }

      await onPatch(project.id, { alertCooldownMinutes: nextCooldown });
      const name = project.displayName || "Untitled project";
      if (fresh.onCooldown && fresh.alertsCooldownUntil) {
        onBlocked({
          title: "Cooldown saved",
          message:
            "This new cooldown will take effect the next time this project cools down. The current cooldown is not affected.",
        });
      } else {
        onToast(`Cooldown updated for ${name}.`);
      }
    } catch {
      setDraftCooldown(project.alertCooldownMinutes);
    } finally {
      setSavingCooldown(false);
    }
  }

  const alertsLocked = !project.alertsEnabled;
  const interactionLocked = creditsLocked || alertsLocked;

  function showCreditsLockedModal() {
    onBlocked({
      title: "Out of credits",
      message:
        "You can’t change this project while you have no alert credits. You also won’t get SMS alerts until you buy more.",
      actionHref: "/credits/",
      actionLabel: "Buy credits",
    });
  }

  function showAlertsOffModal(
    context: "checkInterval" | "pauseDuration" | "postAlertPause"
  ) {
    const message =
      context === "checkInterval"
        ? "Turn the alert on for this project to change how often we check for tasks."
        : context === "pauseDuration"
          ? "Turn the alert on for this project to change how long we pause checking after an alert."
          : "Turn the alert on for this project to resume checking early and end the post-alert pause.";
    onBlocked({
      title: "Alert is off",
      message,
    });
  }

  return (
    <li
      className={`relative overflow-hidden rounded-2xl border border-hs-line bg-white shadow-card ${
        creditsLocked ? "opacity-50" : ""
      }`}
    >
      {creditsLocked ? (
        <button
          type="button"
          className="absolute inset-0 z-20 cursor-pointer rounded-2xl"
          aria-label="Out of credits"
          onClick={showCreditsLockedModal}
        />
      ) : null}
      <div className="border-b border-hs-line bg-hs-bg px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-hs-ink">
                {project.displayName || "Untitled project"}
              </p>
              <RefreshButton
                spinning={refreshingTasks}
                label="Refresh project status"
                onClick={() => onRefreshTasks(project.id)}
              />
            </div>
            <CopyableProjectId id={project.handshakeProjectId} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <AlertsToggle
              on={project.alertsEnabled}
              onToggle={() => {
                void onPatch(project.id, {
                  alertsEnabled: !project.alertsEnabled,
                }).catch(() => undefined);
              }}
            />
            <button
              type="button"
              className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-40"
              disabled={creditsLocked}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-start gap-3 text-xs text-hs-muted">
          <div className="rounded-xl bg-hs-bg px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-hs-muted">
              Last check
            </p>
            <p className="mt-1 font-medium text-hs-ink">
              {project.lastPolledAt
                ? new Date(project.lastPolledAt).toLocaleString()
                : "never"}
            </p>
            <p className="mt-0.5 text-hs-muted">
              {project.lastAvailableCount != null
                ? tasksFoundLabel(project.lastAvailableCount)
                : "No task count yet"}
            </p>
          </div>
        </div>

        {project.onCooldown && project.alertsCooldownUntil ? (
          <div className="relative">
            <div
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 ${
                alertsLocked ? "opacity-40" : ""
              }`}
            >
              <p className="text-sm text-amber-900">
                Pause after alert — time remaining:{" "}
                <span className="tabular-nums font-semibold">
                  {cooldownRemainingLabel(project.alertsCooldownUntil, now)}
                </span>
                . We will resume checking this project then.
              </p>
              <button
                type="button"
                disabled={resettingCooldown || creditsLocked || alertsLocked}
                className="shrink-0 rounded-full border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100/80 disabled:opacity-40"
                onClick={async () => {
                  if (creditsLocked || alertsLocked) return;
                  setResettingCooldown(true);
                  try {
                    await onPatch(project.id, { resetCooldown: true });
                    const name = project.displayName || "Untitled project";
                    onToast(`Checking resumed for ${name}.`);
                  } catch {
                    // Parent surfaces patch errors.
                  } finally {
                    setResettingCooldown(false);
                  }
                }}
              >
                {resettingCooldown ? "Resuming…" : "Resume checking"}
              </button>
            </div>
            {!creditsLocked && alertsLocked ? (
              <button
                type="button"
                className="absolute inset-0 z-10 cursor-pointer rounded-xl"
                aria-label="Alert is off"
                onClick={() => showAlertsOffModal("postAlertPause")}
              />
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <div className={interactionLocked ? "opacity-40" : ""}>
              <OutlinedField
                label="Check about every"
                hint={
                  savingInterval
                    ? "Saving…"
                    : HINTS.checkInterval
                }
                muted={interactionLocked}
              >
                <select
                  disabled={interactionLocked || savingInterval}
                  className="w-full bg-transparent py-1.5 text-sm outline-none disabled:cursor-not-allowed"
                  value={draftInterval}
                  onChange={(e) => {
                    if (interactionLocked || savingInterval) return;
                    const next = Number(e.target.value);
                    setDraftInterval(next);
                    void saveInterval(next);
                  }}
                >
                  {CHECK_INTERVAL_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {formatCheckInterval(minutes)}
                    </option>
                  ))}
                </select>
              </OutlinedField>
            </div>
            {!creditsLocked && alertsLocked ? (
              <button
                type="button"
                className="absolute inset-0 z-10 cursor-pointer rounded-xl"
                aria-label="Alert is off"
                onClick={() => showAlertsOffModal("checkInterval")}
              />
            ) : null}
          </div>
          <div className="relative">
            <div className={interactionLocked ? "opacity-40" : ""}>
              <OutlinedField
                label="After an alert, pause checking for"
                hint={
                  savingCooldown
                    ? "Saving…"
                    : HINTS.alertCooldown
                }
                muted={interactionLocked}
              >
                <select
                  disabled={interactionLocked || savingCooldown}
                  className="w-full bg-transparent py-1.5 text-sm outline-none disabled:cursor-not-allowed"
                  value={draftCooldown}
                  onChange={(e) => {
                    if (interactionLocked || savingCooldown) return;
                    const next = Number(e.target.value);
                    setDraftCooldown(next);
                    void saveCooldown(next);
                  }}
                >
                  {COOLDOWN_INTERVAL_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {formatCooldownInterval(minutes)}
                    </option>
                  ))}
                </select>
              </OutlinedField>
            </div>
            {!creditsLocked && alertsLocked ? (
              <button
                type="button"
                className="absolute inset-0 z-10 cursor-pointer rounded-xl"
                aria-label="Alert is off"
                onClick={() => showAlertsOffModal("pauseDuration")}
              />
            ) : null}
          </div>
        </div>
      </div>
      {confirmDelete ? (
        <ConfirmModal
          title="Delete this project?"
          message={`Are you sure you want to delete ${project.displayName || "this project"}? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            const name = project.displayName || "Untitled project";
            setConfirmDelete(false);
            void onRemove(project.id)
              .then(() => {
                onToast(`${name} was deleted.`);
              })
              .catch(() => undefined);
          }}
        />
      ) : null}
    </li>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [alertCredits, setAlertCredits] = useState<number | null>(null);
  const [smsOptedOut, setSmsOptedOut] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [checkIntervalMinutes, setCheckIntervalMinutes] = useState(
    DEFAULT_CHECK_INTERVAL
  );
  const [alertCooldownMinutes, setAlertCooldownMinutes] = useState(
    DEFAULT_ALERT_COOLDOWN
  );
  const [showAddErrors, setShowAddErrors] = useState(false);
  const [error, setError] = useState("");
  const [addError, setAddError] = useState("");
  const [notice, setNotice] = useState("");
  const addErrorRef = useRef<HTMLParagraphElement>(null);
  const projectIdFieldRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [refreshingTasksId, setRefreshingTasksId] = useState<string | null>(null);
  const [retryingLoad, setRetryingLoad] = useState(false);
  const [blocked, setBlocked] = useState<{
    title: string;
    message: string;
    actionHref?: string;
    actionLabel?: string;
  } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  function showToast(message: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message }]);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  async function loadCredits() {
    const data = await api<{
      user: { alertCredits: number; welcomeSeen?: boolean; smsOptedOut?: boolean };
    }>("/api/handshake/me");
    setAlertCredits(data.user.alertCredits);
    setSmsOptedOut(Boolean(data.user.smsOptedOut));
    if (data.user.welcomeSeen === false) {
      setShowWelcome(true);
    }
  }

  async function load() {
    const [projectsData] = await Promise.all([
      api<{ projects: Project[] }>("/api/handshake/projects"),
      loadCredits().catch(() => undefined),
    ]);
    setProjects(projectsData.projects);
  }

  function isOutOfCreditsError(message: string) {
    return /out of alert credits|buy more credits|no alert credits/i.test(
      message
    );
  }

  function showOutOfCreditsModal(message?: string) {
    setBlocked({
      title: "Out of credits",
      message:
        message ||
        "You’re out of alert credits. Buy more to keep receiving SMS alerts.",
      actionHref: "/credits/",
      actionLabel: "Buy credits",
    });
  }

  async function loadWithRetries(retries = 2) {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        await load();
        setError("");
        return;
      } catch (err) {
        lastError = err;
        if (String((err as Error)?.message ?? "").includes("Unauthorized")) {
          throw err;
        }
        if (attempt < retries) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, 400 * (attempt + 1))
          );
        }
      }
    }
    throw lastError;
  }

  function handleLoadFailure(err: unknown) {
    if (String((err as Error)?.message ?? "").includes("Unauthorized")) {
      clearToken();
      router.replace("/sign-in");
      return;
    }
    setError(err instanceof Error ? err.message : "Failed to load");
  }

  async function retryDashboardLoad() {
    setRetryingLoad(true);
    setError("");
    setNotice("");
    try {
      await loadWithRetries();
    } catch (err) {
      handleLoadFailure(err);
    } finally {
      setRetryingLoad(false);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace("/sign-in");
      return;
    }
    loadWithRetries()
      .catch(handleLoadFailure)
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only dashboard bootstrap
  }, [router]);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function refreshMe() {
      if (cancelled || document.visibilityState !== "visible") return;
      try {
        await loadCredits();
      } catch (err) {
        if (String((err as Error)?.message ?? "").includes("Unauthorized")) {
          clearToken();
          router.replace("/sign-in");
        }
      }
    }

    async function refreshProjects() {
      if (cancelled || document.visibilityState !== "visible") return;
      try {
        const data = await api<{ projects: Project[] }>("/api/handshake/projects");
        if (!cancelled) setProjects(data.projects);
      } catch (err) {
        if (String((err as Error)?.message ?? "").includes("Unauthorized")) {
          clearToken();
          router.replace("/sign-in");
        }
      }
    }

    function refreshAll() {
      void refreshMe();
      void refreshProjects();
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") refreshAll();
    };

    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onVisible);

    void refreshMe();
    const meTimer = window.setInterval(refreshMe, ME_POLL_MS);
    const projectsTimer = window.setInterval(refreshProjects, PROJECTS_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(meTimer);
      window.clearInterval(projectsTimer);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- poll + tab-focus refresh while dashboard is open
  }, [ready, router]);

  useLayoutEffect(() => {
    if (!addError) return;
    const el = addErrorRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    });
  }, [addError]);

  useLayoutEffect(() => {
    if (!showAddErrors || projectId.trim()) return;
    const el = projectIdFieldRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    });
  }, [showAddErrors, projectId]);

  async function addProject(e: FormEvent) {
    e.preventDefault();
    setError("");
    setAddError("");
    setNotice("");
    const missingProjectId = !projectId.trim();
    if (missingProjectId) {
      setShowAddErrors(true);
      return;
    }
    setBusy(true);
    try {
      const data = await api<{
        project: Project;
        alertCredits?: number;
        notice?: string;
      }>("/api/handshake/projects", {
        method: "POST",
        body: JSON.stringify({
          handshakeProjectId: projectId.trim(),
          checkIntervalMinutes,
          alertCooldownMinutes,
        }),
      });
      setProjectId("");
      setCheckIntervalMinutes(DEFAULT_CHECK_INTERVAL);
      setAlertCooldownMinutes(DEFAULT_ALERT_COOLDOWN);
      setShowAddErrors(false);
      if (typeof data.alertCredits === "number") {
        setAlertCredits(data.alertCredits);
      }
      if (data.notice) {
        setNotice(data.notice);
      }
      await load();
      const name = data.project.displayName || "Untitled project";
      showToast(
        `${name} was successfully added. Scroll down to view it in Your projects.`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add project";
      setAddError(message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setError("");
    const data = await api<{
      project: Project;
    }>(`/api/handshake/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setProjects((prev) => prev.map((p) => (p.id === id ? data.project : p)));
    return data;
  }

  async function remove(id: string) {
    setError("");
    await api(`/api/handshake/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function refreshTasks(id: string) {
    setError("");
    setNotice("");
    setRefreshingTasksId(id);
    try {
      const data = await api<{
        availableCount: number;
        lastPolledAt?: string;
        project?: Project;
      }>(`/api/handshake/projects/${id}/test`, { method: "POST" });
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== id) return project;
          const lastPolledAt =
            data.project?.lastPolledAt ??
            data.lastPolledAt ??
            new Date().toISOString();
          // Always sync latest fields from the server on refresh.
          if (data.project) {
            return {
              ...project,
              lastAvailableCount: TEST_MODE
                ? data.project.lastAvailableCount ?? TEST_MODE_TASK_COUNT
                : data.project.lastAvailableCount,
              lastPolledAt,
              checkIntervalMinutes: data.project.checkIntervalMinutes,
              alertCooldownMinutes: data.project.alertCooldownMinutes,
              alertsCooldownUntil: data.project.alertsCooldownUntil,
              onCooldown: data.project.onCooldown,
              lastAlertedAt: data.project.lastAlertedAt,
            };
          }
          return {
            ...project,
            lastAvailableCount: TEST_MODE
              ? TEST_MODE_TASK_COUNT
              : data.availableCount,
            lastPolledAt,
          };
        })
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refresh failed";
      if (isOutOfCreditsError(message)) {
        showOutOfCreditsModal(message);
      } else {
        setError(message);
      }
    } finally {
      setRefreshingTasksId(null);
      void loadCredits().catch(() => undefined);
    }
  }

  async function refreshStatus(id: string) {
    setError("");
    setNotice("");
    const data = await api<{ projects: Project[] }>("/api/handshake/projects");
    setProjects(data.projects);
    return data.projects.find((project) => project.id === id) ?? null;
  }

  const outOfCredits = alertCredits !== null && alertCredits <= 0;

  if (!ready) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-20 text-center text-sm text-hs-muted">
        Loading your dashboard…
      </main>
    );
  }

  const alertsOn = projects.filter((p) => p.alertsEnabled).length;

  return (
    <main>
      <section className="relative overflow-hidden border-b border-hs-line bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(211,251,82,0.12),_transparent_45%)]" />
        <div className="relative mx-auto grid max-w-5xl gap-6 px-6 py-12 md:grid-cols-[minmax(0,1fr)_15.5rem] md:items-start md:gap-8">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hs-muted">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-hs-ink md:text-4xl">
              Manage Handshake project alerts
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-hs-muted">
              Add projects, turn each project&apos;s alert on or off, and choose
              how often we check for tasks.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-hs-line bg-hs-bg px-4 py-2 text-sm font-medium text-hs-ink">
                {projects.length} project{projects.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-hs-line bg-hs-bg px-4 py-2 text-sm font-medium text-hs-ink">
                {alertsOn} alert{alertsOn === 1 ? "" : "s"} on
              </span>
            </div>
          </div>
          <CreditsBanner credits={alertCredits} compact />
        </div>
      </section>

      <div className="relative">
      <div className="mx-auto max-w-5xl px-6 py-10">
      <AlertNumberBanner />

      <form
        id="add-project"
        onSubmit={addProject}
        className="mt-8 scroll-mt-24 overflow-hidden rounded-2xl border border-hs-line bg-white shadow-card"
      >
        <div className="border-b border-hs-line bg-hs-bg px-6 py-4">
          <h2 className="text-lg font-semibold text-hs-ink">Add a project</h2>
          <p className="mt-1 text-sm text-hs-muted">
            Scroll down to paste a Handshake project UUID and choose how often
            we check for claimable tasks and how long to pause after an alert.
          </p>
        </div>
        <div className="p-6">
        <p className="text-sm font-medium text-hs-ink">
          How to find your project ID
        </p>
        <div className="mt-3 aspect-video overflow-hidden rounded-xl border border-hs-line bg-hs-bg">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/1g_bKwVpHvM"
            title="How to find your Handshake project ID"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="mt-6 grid gap-4">
          <div ref={projectIdFieldRef} className="scroll-mt-28">
            <OutlinedField
              label="Project ID"
              hint={HINTS.projectId}
              invalid={
                (showAddErrors && !projectId.trim()) ||
                Boolean(addError && isProjectIdAddError(addError))
              }
            >
              <input
                className="w-full bg-transparent py-1.5 font-mono text-sm outline-none"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  if (addError) setAddError("");
                  if (showAddErrors) setShowAddErrors(false);
                }}
              />
            </OutlinedField>
            {showAddErrors && !projectId.trim() ? (
              <p className="mt-2 text-sm text-red-700">Enter a Handshake project ID.</p>
            ) : null}
          </div>
          <OutlinedField
            label="Check about every"
            hint={HINTS.checkInterval}
          >
            <select
              className="w-full bg-transparent py-1.5 text-sm outline-none"
              value={checkIntervalMinutes}
              onChange={(e) =>
                setCheckIntervalMinutes(Number(e.target.value))
              }
            >
              {CHECK_INTERVAL_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {formatCheckInterval(minutes)}
                </option>
              ))}
            </select>
          </OutlinedField>
          <OutlinedField
            label="After an alert, pause checking for"
            hint={HINTS.alertCooldown}
          >
            <select
              className="w-full bg-transparent py-1.5 text-sm outline-none"
              value={alertCooldownMinutes}
              onChange={(e) =>
                setAlertCooldownMinutes(Number(e.target.value))
              }
            >
              {COOLDOWN_INTERVAL_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {formatCooldownInterval(minutes)}
                </option>
              ))}
            </select>
          </OutlinedField>
          {addError ? (
            <p
              ref={addErrorRef}
              className="scroll-mt-28 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {addError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className={`btn-primary w-full sm:w-auto ${
              busy || !projectId.trim() ? "opacity-50" : ""
            }`}
          >
            {busy ? "Checking…" : "Add project"}
          </button>
        </div>
        </div>
      </form>

      {error ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            disabled={retryingLoad}
            className="shrink-0 rounded-full border border-red-300 bg-white px-4 py-1.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50"
            onClick={() => {
              void retryDashboardLoad();
            }}
          >
            {retryingLoad ? "Trying…" : "Try again"}
          </button>
        </div>
      ) : null}
      {notice && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      <div className="mt-10 space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-hs-line bg-white px-6 py-14 text-center">
            <p className="text-lg font-semibold text-hs-ink">No projects yet</p>
            <p className="mt-2 text-sm text-hs-muted">
              Add a Handshake project ID above to start receiving alerts.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-hs-ink">Your projects</h2>
            {TEST_MODE ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
                Test mode on
              </p>
            ) : null}
            <ul className="space-y-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  refreshingTasks={refreshingTasksId === project.id}
                  creditsLocked={outOfCredits}
                  onPatch={async (id, body) => {
                    try {
                      return await patch(id, body);
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "Update failed"
                      );
                      throw err;
                    }
                  }}
                  onRemove={async (id) => {
                    try {
                      await remove(id);
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "Delete failed"
                      );
                      throw err;
                    }
                  }}
                  onRefreshTasks={refreshTasks}
                  onRefreshStatus={refreshStatus}
                  onBlocked={setBlocked}
                  onToast={showToast}
                />
              ))}
            </ul>
          </>
        )}
      </div>
      {outOfCredits ? <ZeroCreditsLockModal stacked={smsOptedOut} /> : null}
      {smsOptedOut ? <SmsOptOutLockModal /> : null}
      {!outOfCredits && !smsOptedOut && showWelcome ? (
        <WelcomeCreditsModal onClose={() => setShowWelcome(false)} />
      ) : null}
      {blocked ? (
        <MessageModal
          title={blocked.title}
          message={blocked.message}
          actionHref={blocked.actionHref}
          actionLabel={blocked.actionLabel}
          onClose={() => setBlocked(null)}
        />
      ) : null}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
      </div>
    </main>
  );
}
