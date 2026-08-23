"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-500 text-[10px] font-medium leading-none text-zinc-600 hover:bg-zinc-100"
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
          className="absolute left-0 top-5 z-30 w-56 rounded-md border border-zinc-200 bg-white p-2 text-left text-xs font-normal leading-snug text-zinc-700 shadow-md"
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
      <span className="text-zinc-700">Alerts</span>
      <span
        className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
          on ? "bg-hs-dark" : "bg-hs-line"
        }`}
      >
        <span
          className={`pointer-events-none absolute text-[11px] font-medium ${
            on ? "left-1.5 text-white" : "right-1.5 text-zinc-600"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <p className="font-medium">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{message}</p>
        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-hs-dark py-2 text-sm font-medium text-white"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <p className="font-medium">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{message}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-red-700 py-2 text-sm font-medium text-white hover:bg-red-800"
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
}: {
  project: Project;
  refreshingTasks: boolean;
  onPatch: (id: string, body: Record<string, unknown>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onRefreshTasks: (id: string) => void;
  onRefreshStatus: (id: string) => void;
  onBlocked: (blocked: { title: string; message: string }) => void;
}) {
  const savedCooldown = project.alertCooldownHours ?? 3;
  const [draftMax, setDraftMax] = useState(project.maxAlertCount);
  const [draftCooldown, setDraftCooldown] = useState(savedCooldown);
  const [saving, setSaving] = useState(false);
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
    const cooldownChangedDuringCooldown =
      project.onCooldown && draftCooldown !== savedCooldown;
    setSaving(true);
    try {
      await onPatch(project.id, body);
      if (cooldownChangedDuringCooldown) {
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
    <li className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{project.displayName || "Untitled project"}</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            {project.handshakeProjectId}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
            <p>
              Last check:{" "}
              {project.lastPolledAt
                ? new Date(project.lastPolledAt).toLocaleString()
                : "never"}
              {project.lastAvailableCount != null
                ? ` · ${tasksFoundLabel(project.lastAvailableCount)}`
                : ""}
            </p>
            <RefreshButton
              spinning={refreshingTasks}
              label="Refresh tasks"
              onClick={() => onRefreshTasks(project.id)}
            />
          </div>
        </div>
        <AlertsToggle
          on={project.alertsEnabled}
          onToggle={() =>
            onPatch(project.id, { alertsEnabled: !project.alertsEnabled })
          }
        />
      </div>
      {project.onCooldown && project.alertsCooldownUntil ? (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Cooldown time remaining:{" "}
          <span className="tabular-nums">
            {cooldownRemainingLabel(project.alertsCooldownUntil, now)}
          </span>
          . We will start checking this project again then, with a fresh alert
          count.
        </p>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
            className="w-full cursor-default bg-transparent py-1.5 text-sm text-zinc-400 outline-none"
            value={project.remainingAlerts}
            tabIndex={-1}
          />
        </OutlinedField>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white disabled:opacity-40"
          disabled={!dirty || saving}
          onClick={() => saveEdits()}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-40"
          disabled={!dirty || saving}
          onClick={cancelEdits}
        >
          Cancel
        </button>
        <button
          type="button"
          className="ml-auto rounded border border-red-700 px-3 py-1 text-red-700 hover:bg-red-50"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </button>
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
          if (TEST_MODE) {
            const serverMockedTasks =
              (data.project?.lastAvailableCount ?? data.availableCount) > 2;
            if (serverMockedTasks && data.project) {
              return {
                ...project,
                lastAvailableCount: data.project.lastAvailableCount,
                lastPolledAt: data.project.lastPolledAt,
                remainingAlerts: data.project.remainingAlerts,
                alertsSentCount: data.project.alertsSentCount,
                onCooldown: data.project.onCooldown,
                alertsCooldownUntil: data.project.alertsCooldownUntil,
              };
            }
            if (!project.alertsEnabled || project.onCooldown || project.remainingAlerts <= 0) {
              return {
                ...project,
                lastAvailableCount: TEST_MODE_TASK_COUNT,
                lastPolledAt,
              };
            }
            const nextRemaining = Math.max(0, project.remainingAlerts - 1);
            const hitCap = nextRemaining === 0;
            return {
              ...project,
              lastAvailableCount: TEST_MODE_TASK_COUNT,
              lastPolledAt,
              remainingAlerts: nextRemaining,
              alertsSentCount: project.alertsSentCount + 1,
              onCooldown: hitCap,
              alertsCooldownUntil: hitCap
                ? new Date(
                    Date.now() + (project.alertCooldownHours ?? 3) * 60 * 60 * 1000
                  ).toISOString()
                : project.alertsCooldownUntil,
            };
          }
          if (data.project) {
            return {
              ...project,
              lastAvailableCount: data.project.lastAvailableCount,
              lastPolledAt: data.project.lastPolledAt,
              remainingAlerts: data.project.remainingAlerts,
              alertsSentCount: data.project.alertsSentCount,
              onCooldown: data.project.onCooldown,
              alertsCooldownUntil: data.project.alertsCooldownUntil,
            };
          }
          return {
            ...project,
            lastAvailableCount: data.availableCount,
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
      <main className="mx-auto max-w-3xl px-6 py-16 text-sm text-zinc-500">
        Loading…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="relative">
        <h1 className="px-24 text-center text-2xl font-semibold">Manage Handshake Project Alerts</h1>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          onClick={() => {
            clearToken();
            router.push("/");
          }}
        >
          Sign out
        </button>
      </div>

      <form
        onSubmit={addProject}
        className="mt-6 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <h2 className="text-center text-lg font-semibold">Add Project</h2>
        <p className="mt-1 text-center text-sm text-zinc-600">
          How to find your project ID
        </p>
        <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/1g_bKwVpHvM"
            title="How to find your Handshake project ID"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="mt-4 grid gap-4">
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
          <div className="flex flex-wrap items-start justify-center gap-3">
            <div className="w-40">
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
            </div>
            <div className="w-44">
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
          </div>
          <button
            type="submit"
            disabled={busy}
            className={`mx-auto block w-fit rounded-full px-5 py-2 text-sm font-medium text-white ${
              busy ||
              !projectId.trim() ||
              maxAlertCount === "" ||
              cooldownHours === ""
                ? "bg-hs-dark/40"
                : "bg-hs-dark"
            } disabled:opacity-50`}
          >
            {busy ? "Checking…" : "Add Project"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {notice && <p className="mt-4 text-sm text-emerald-700">{notice}</p>}

      {projects.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Add a Handshake project ID to start managing alerts.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {TEST_MODE ? (
            <p className="rounded-xl border border-red-600 bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-700">
              Test Mode On
            </p>
          ) : null}
          <ul className="space-y-3">
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
    </main>
  );
}
