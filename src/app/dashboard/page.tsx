"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertNumberBanner } from "@/components/AlertNumberBanner";
import {
  api,
  clearToken,
  getToken,
  type Project,
} from "@/lib/api";
import { TEST_MODE, TEST_MODE_TASK_COUNT } from "@/lib/constants";

const HINTS = {
  projectId:
    "The Handshake project UUID from the project page. The video above shows where to copy it.",
  maxAlerts:
    "How many texts we will send for this project when tasks show up, before we pause. We send at most one text every 10 minutes.",
  cooldownHours:
    "After we hit max alerts, we stop texting for this project for this many hours. Then the count resets and we start again.",
  remaining:
    "How many texts we can still send for this project before we pause. This drops as we text you, and it cannot go above Max alerts.",
};

function FieldHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!pinned) return;
    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setPinned(false);
        setOpen(false);
      }
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
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => {
          if (!pinned) setOpen(false);
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setPinned((current) => {
            const next = !current;
            setOpen(next);
            return next;
          });
        }}
      >
        ?
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute left-0 top-5 z-30 w-56 rounded-xl border border-hs-line bg-white p-3 text-left text-xs font-normal leading-snug text-hs-muted shadow-card"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => {
            if (!pinned) setOpen(false);
          }}
        >
          {text}
        </span>
      ) : null}
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
      aria-label="Alerts"
      onClick={onToggle}
      className="inline-flex items-center gap-2 text-sm"
    >
      <span className="text-hs-muted">Alerts</span>
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
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-hs-dark/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-hs-line bg-white p-6 shadow-card">
        <p className="text-lg font-semibold text-hs-ink">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-hs-muted">{message}</p>
        <button
          type="button"
          className="btn-primary mt-5 w-full"
          onClick={onClose}
        >
          OK
        </button>
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

function clampInt(raw: string, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
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
function ProjectCard({
  project,
  refreshingTasks,
  onPatch,
  onRemove,
  onRefreshTasks,
  onRefreshStatus,
  onBlocked,
  onResetCooldown,
}: {
  project: Project;
  refreshingTasks: boolean;
  onPatch: (id: string, body: Record<string, unknown>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onRefreshTasks: (id: string) => void;
  onRefreshStatus: (id: string) => void;
  onBlocked: (blocked: { title: string; message: string }) => void;
  onResetCooldown?: (id: string) => Promise<void>;
}) {
  const savedCooldown = project.alertCooldownHours ?? 3;
  const [draftMax, setDraftMax] = useState(project.maxAlertCount);
  const [draftCooldown, setDraftCooldown] = useState(savedCooldown);
  const [saving, setSaving] = useState(false);
  const [resettingCooldown, setResettingCooldown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const expiredRefresh = useRef(false);

  useEffect(() => {
    setDraftMax(project.maxAlertCount);
    setDraftCooldown(project.alertCooldownHours ?? 3);
  }, [
    project.maxAlertCount,
    project.alertCooldownHours,
    project.onCooldown,
    project.alertsCooldownUntil,
  ]);

  useEffect(() => {
    if (!project.onCooldown || !project.alertsCooldownUntil) {
      expiredRefresh.current = false;
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(id);
  }, [project.onCooldown, project.alertsCooldownUntil]);

  useEffect(() => {
    if (!project.onCooldown || !project.alertsCooldownUntil) return;
    if (new Date(project.alertsCooldownUntil).getTime() > now) return;
    if (expiredRefresh.current) return;
    expiredRefresh.current = true;
    onRefreshStatus(project.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- parent passes a new callback each render
  }, [now, project.id, project.onCooldown, project.alertsCooldownUntil]);

  const dirty =
    draftMax !== project.maxAlertCount || draftCooldown !== savedCooldown;

  function cancelEdits() {
    setDraftMax(project.maxAlertCount);
    setDraftCooldown(savedCooldown);
  }

  function blockMaxDecrease() {
    setDraftMax(project.maxAlertCount);
    onBlocked({
      title: "Can't lower this setting",
      message:
        "You can't lower max alerts on a project that's already added. Delete the project and add it again if you want a smaller number.",
    });
  }

  async function saveEdits() {
    const body: Record<string, unknown> = {};
    if (draftMax !== project.maxAlertCount) body.maxAlertCount = draftMax;
    if (draftCooldown !== savedCooldown) body.alertCooldownHours = draftCooldown;
    if (Object.keys(body).length === 0) return;
    const maxRaisedDuringCooldown =
      project.onCooldown && draftMax !== project.maxAlertCount;
    const cooldownChangedDuringCooldown =
      project.onCooldown && draftCooldown !== savedCooldown;
    setSaving(true);
    try {
      await onPatch(project.id, body);
      if (maxRaisedDuringCooldown) {
        onBlocked({
          title: "Max alerts saved",
          message:
            "This higher max will take effect after the current cooldown finishes. The cooldown timer is not reset, and no extra alerts will send until then.",
        });
      } else if (cooldownChangedDuringCooldown) {
        onBlocked({
          title: "Cooldown hours saved",
          message:
            "This new cooldown will take effect the next time this project cools down. The current cooldown is not affected.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="overflow-hidden rounded-2xl border border-hs-line bg-white shadow-card">
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
            <p className="mt-1 truncate font-mono text-xs text-hs-muted">
              {project.handshakeProjectId}
            </p>
          </div>
          <AlertsToggle
            on={project.alertsEnabled}
            onToggle={() =>
              onPatch(project.id, { alertsEnabled: !project.alertsEnabled })
            }
          />
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

        {(project.onCooldown && project.alertsCooldownUntil) ||
        (project.remainingAlerts === 0 && project.alertsCooldownUntil) ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Cooldown time remaining:{" "}
              <span className="tabular-nums font-semibold">
                {cooldownRemainingLabel(project.alertsCooldownUntil, now)}
              </span>
              . We will start checking this project again then, with a fresh alert
              count.
            </p>
            {TEST_MODE && onResetCooldown ? (
              <button
                type="button"
                disabled={resettingCooldown}
                className="rounded-full border border-amber-700 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-50 disabled:opacity-50"
                onClick={async () => {
                  setResettingCooldown(true);
                  try {
                    await onResetCooldown(project.id);
                  } finally {
                    setResettingCooldown(false);
                  }
                }}
              >
                {resettingCooldown ? "Resetting…" : "Reset cooldown (test)"}
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <OutlinedField label="Max alerts" hint={HINTS.maxAlerts}>
            <input
              type="number"
              min={1}
              max={12}
              className="w-full bg-transparent py-1.5 text-sm outline-none"
              value={draftMax}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && draftMax <= project.maxAlertCount) {
                  e.preventDefault();
                  e.currentTarget.value = String(project.maxAlertCount);
                  blockMaxDecrease();
                }
              }}
              onChange={(e) => {
                const value = clampInt(e.target.value, 1, 12);
                if (value < project.maxAlertCount) {
                  e.target.value = String(project.maxAlertCount);
                  blockMaxDecrease();
                  return;
                }
                setDraftMax(value);
              }}
            />
          </OutlinedField>
          <OutlinedField label="Cooldown hours" hint={HINTS.cooldownHours}>
            <input
              type="number"
              min={1}
              max={72}
              className="w-full bg-transparent py-1.5 text-sm outline-none"
              value={draftCooldown}
              onChange={(e) => {
                setDraftCooldown(clampInt(e.target.value, 1, 72));
              }}
            />
          </OutlinedField>
          <OutlinedField label="Alerts left this round" hint={HINTS.remaining} muted>
            <input
              readOnly
              className="w-full cursor-default bg-transparent py-1.5 text-sm text-hs-muted outline-none"
              value={project.remainingAlerts}
              tabIndex={-1}
            />
          </OutlinedField>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-hs-line pt-4">
          <button
            type="button"
            className="btn-primary-sm disabled:opacity-40"
            disabled={!dirty || saving}
            onClick={() => saveEdits()}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            className="rounded-full border border-hs-line px-4 py-2 text-sm font-semibold text-hs-ink transition hover:border-hs-ink disabled:opacity-40"
            disabled={!dirty || saving}
            onClick={cancelEdits}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ml-auto rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        </div>
      </div>
      {confirmDelete ? (
        <ConfirmModal
          title="Delete this project?"
          message={`Are you sure you want to delete ${project.displayName || "this project"}? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            onRemove(project.id);
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
  const [projectId, setProjectId] = useState("");
  const [maxAlertCount, setMaxAlertCount] = useState<number | "">("");
  const [cooldownHours, setCooldownHours] = useState<number | "">("");
  const [showAddErrors, setShowAddErrors] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshingTasksId, setRefreshingTasksId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<{ title: string; message: string } | null>(null);

  async function load() {
    const data = await api<{ projects: Project[] }>("/api/handshake/projects");
    setProjects(data.projects);
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace("/sign-in");
      return;
    }
    load()
      .catch((err) => {
        if (String(err.message).includes("Unauthorized")) {
          clearToken();
          router.replace("/sign-in");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => setReady(true));
  }, [router]);

  useEffect(() => {
    const next = projects
      .map((p) => p.alertsCooldownUntil)
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).getTime())
      .filter((time) => time > Date.now())
      .sort((a, b) => a - b)[0];
    if (!next) return;
    const id = window.setTimeout(() => {
      load().catch(() => {});
    }, next - Date.now() + 750);
    return () => window.clearTimeout(id);
  }, [projects]);

  async function addProject(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    const missingProjectId = !projectId.trim();
    const missingMax = maxAlertCount === "";
    const missingCooldown = cooldownHours === "";
    if (missingProjectId || missingMax || missingCooldown) {
      setShowAddErrors(true);
      return;
    }
    setBusy(true);
    try {
      await api("/api/handshake/projects", {
        method: "POST",
        body: JSON.stringify({
          handshakeProjectId: projectId.trim(),
          maxAlertCount,
          alertCooldownHours: cooldownHours,
        }),
      });
      setProjectId("");
      setMaxAlertCount("");
      setCooldownHours("");
      setShowAddErrors(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add project");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setError("");
    const data = await api<{ project: Project }>(`/api/handshake/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setProjects((prev) => prev.map((p) => (p.id === id ? data.project : p)));
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
          // Always sync latest alert-round fields from the server. Refresh does
          // not decrement alerts — it only reads current remaining/cooldown.
          if (data.project) {
            return {
              ...project,
              lastAvailableCount: TEST_MODE
                ? data.project.lastAvailableCount ?? TEST_MODE_TASK_COUNT
                : data.project.lastAvailableCount,
              lastPolledAt,
              maxAlertCount: data.project.maxAlertCount,
              alertCooldownHours: data.project.alertCooldownHours,
              remainingAlerts: data.project.remainingAlerts,
              alertsSentCount: data.project.alertsSentCount,
              onCooldown: data.project.onCooldown,
              alertsCooldownUntil: data.project.alertsCooldownUntil,
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
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshingTasksId(null);
    }
  }

  async function refreshStatus(id: string) {
    setError("");
    setNotice("");
    try {
      const data = await api<{ projects: Project[] }>("/api/handshake/projects");
      const updated = data.projects.find((project) => project.id === id);
      if (!updated) return;
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? {
                ...project,
                maxAlertCount: updated.maxAlertCount,
                alertCooldownHours: updated.alertCooldownHours,
                remainingAlerts: updated.remainingAlerts,
                alertsSentCount: updated.alertsSentCount,
                alertsCooldownUntil: updated.alertsCooldownUntil,
                onCooldown: updated.onCooldown,
              }
            : project
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    }
  }

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
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hs-muted">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-hs-ink md:text-4xl">
            Manage Handshake project alerts
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-hs-muted">
            Add projects, turn alerts on or off, and control how often we text
            you when claimable tasks show up.
          </p>
          {projects.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-hs-line bg-hs-bg px-4 py-2 text-sm font-medium text-hs-ink">
                {projects.length} project{projects.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-hs-line bg-hs-bg px-4 py-2 text-sm font-medium text-hs-ink">
                {alertsOn} alert{alertsOn === 1 ? "" : "s"} on
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-10">
      <AlertNumberBanner />

      <form
        onSubmit={addProject}
        className="mt-8 overflow-hidden rounded-2xl border border-hs-line bg-white shadow-card"
      >
        <div className="border-b border-hs-line bg-hs-bg px-6 py-4">
          <h2 className="text-lg font-semibold text-hs-ink">Add a project</h2>
          <p className="mt-1 text-sm text-hs-muted">
            Paste a Handshake project UUID and choose your alert settings.
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
          <OutlinedField
            label="Project ID"
            hint={HINTS.projectId}
            invalid={showAddErrors && !projectId.trim()}
          >
            <input
              className="w-full bg-transparent py-1.5 font-mono text-sm outline-none"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </OutlinedField>
          <div className="grid gap-4 sm:grid-cols-2">
            <OutlinedField
              label="Max alerts"
              hint={HINTS.maxAlerts}
              invalid={showAddErrors && maxAlertCount === ""}
            >
              <input
                type="number"
                min={1}
                max={12}
                className="w-full bg-transparent py-1.5 text-sm outline-none"
                value={maxAlertCount}
                onChange={(e) =>
                  setMaxAlertCount(
                    e.target.value === "" ? "" : clampInt(e.target.value, 1, 12)
                  )
                }
              />
            </OutlinedField>
            <OutlinedField
              label="Cooldown hours"
              hint={HINTS.cooldownHours}
              invalid={showAddErrors && cooldownHours === ""}
            >
              <input
                type="number"
                min={1}
                max={72}
                className="w-full bg-transparent py-1.5 text-sm outline-none"
                value={cooldownHours}
                onChange={(e) =>
                  setCooldownHours(
                    e.target.value === "" ? "" : clampInt(e.target.value, 1, 72)
                  )
                }
              />
            </OutlinedField>
          </div>
          <button
            type="submit"
            disabled={busy}
            className={`btn-primary w-full sm:w-auto ${
              busy ||
              !projectId.trim() ||
              maxAlertCount === "" ||
              cooldownHours === ""
                ? "opacity-50"
                : ""
            }`}
          >
            {busy ? "Checking…" : "Add project"}
          </button>
        </div>
        </div>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      {projects.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-hs-line bg-white px-6 py-14 text-center">
          <p className="text-lg font-semibold text-hs-ink">No projects yet</p>
          <p className="mt-2 text-sm text-hs-muted">
            Add a Handshake project ID above to start receiving alerts.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
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
              onPatch={async (id, body) => {
                try {
                  await patch(id, body);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Update failed");
                }
              }}
              onRemove={async (id) => {
                try {
                  await remove(id);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Delete failed");
                }
              }}
              onRefreshTasks={refreshTasks}
              onRefreshStatus={refreshStatus}
              onBlocked={setBlocked}
              onResetCooldown={
                TEST_MODE
                  ? async (id) => {
                      try {
                        await patch(id, { resetCooldown: true });
                      } catch {
                        // Frontend-only test mode still clears local cooldown.
                        setProjects((prev) =>
                          prev.map((project) =>
                            project.id === id
                              ? {
                                  ...project,
                                  alertsSentCount: 0,
                                  remainingAlerts: project.maxAlertCount,
                                  alertsCooldownUntil: null,
                                  onCooldown: false,
                                }
                              : project
                          )
                        );
                      }
                    }
                  : undefined
              }
            />
          ))}
          </ul>
        </div>
      )}
      {blocked ? (
        <MessageModal
          title={blocked.title}
          message={blocked.message}
          onClose={() => setBlocked(null)}
        />
      ) : null}
      </div>
    </main>
  );
}
