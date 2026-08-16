"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  api,
  clearToken,
  getToken,
  type Project,
} from "@/lib/api";

const HINTS = {
  projectId:
    "The Handshake project UUID from the project page. The video above shows where to copy it.",
  maxAlerts:
    "How many texts we will send for this project when tasks show up, before we pause. We send at most one text per check.",
  cooldownHours:
    "After we hit max alerts, we stop texting this project for this many hours. Then the count resets and we start again.",
  remaining:
    "How many texts we can still send before this project pauses. This drops as we text you, and it cannot go above Max alerts.",
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
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="relative min-w-0 rounded-md border border-zinc-900 px-3 pb-1.5 pt-0.5">
      <legend className="inline-flex items-center px-1 text-[13px] leading-none text-zinc-900">
        {label}
        {hint ? <FieldHint text={hint} /> : null}
      </legend>
      {children}
    </fieldset>
  );
}

function clampInt(raw: string, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function formatCooldown(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [maxAlertCount, setMaxAlertCount] = useState(1);
  const [cooldownHours, setCooldownHours] = useState(3);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

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
      setMaxAlertCount(1);
      setCooldownHours(3);
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

  async function testNow(id: string) {
    setError("");
    setNotice("");
    setTestingId(id);
    try {
      const data = await api<{ availableCount: number }>(
        `/api/handshake/projects/${id}/test`,
        { method: "POST" }
      );
      setNotice(
        data.availableCount > 2
          ? `Tasks found: ${data.availableCount} claimable (this does not send an SMS).`
          : `No alert threshold hit. Claimable tasks: ${data.availableCount}.`
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTestingId(null);
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
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
            Handshake Alerts
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Projects</h1>
        </div>
        <button
          className="text-sm text-zinc-500 hover:text-zinc-800"
          onClick={() => {
            clearToken();
            router.push("/");
          }}
        >
          Sign out
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        We check each of your projects for claimable tasks about every 10 minutes.
        If a project has more than 2 tasks waiting, we send you one text. We can
        keep texting on later checks, up to the max alerts you set for that
        project. After that, we pause that project for the cooldown you set
        (3 hours by default), then the count resets and alerts start again on
        their own.
      </p>

      <form
        onSubmit={addProject}
        className="mt-6 rounded-xl border border-zinc-200 bg-white p-4"
      >
        <h2 className="text-sm font-medium">Add project</h2>
        <p className="mt-1 text-sm text-zinc-600">How to find your project ID</p>
        <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
          <iframe
            className="h-full w-full"
            src="https://www.youtube-nocookie.com/embed/1g_bKwVpHvM"
            title="How to find your Handshake project ID"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="mt-4 grid gap-4">
          <OutlinedField label="Project ID" hint={HINTS.projectId}>
            <input
              className="w-full bg-transparent py-1.5 font-mono text-sm outline-none"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            />
          </OutlinedField>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <OutlinedField label="Max alerts" hint={HINTS.maxAlerts}>
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="w-full bg-transparent py-1.5 text-sm outline-none"
                  value={maxAlertCount}
                  onChange={(e) => setMaxAlertCount(clampInt(e.target.value, 1, 12))}
                  required
                />
              </OutlinedField>
            </div>
            <div className="w-44">
              <OutlinedField label="Cooldown hours" hint={HINTS.cooldownHours}>
                <input
                  type="number"
                  min={1}
                  max={72}
                  className="w-full bg-transparent py-1.5 text-sm outline-none"
                  value={cooldownHours}
                  onChange={(e) => setCooldownHours(clampInt(e.target.value, 1, 72))}
                  required
                />
              </OutlinedField>
            </div>
            <button
              disabled={busy}
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Checking…" : "Add"}
            </button>
          </div>
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
        <ul className="mt-6 space-y-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {project.displayName || "Untitled project"}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-zinc-500">
                    {project.handshakeProjectId}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Last check:{" "}
                    {project.lastPolledAt
                      ? new Date(project.lastPolledAt).toLocaleString()
                      : "never"}
                    {project.lastAvailableCount != null
                      ? ` · ${project.lastAvailableCount} claimable`
                      : ""}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  Alerts
                  <input
                    type="checkbox"
                    checked={project.alertsEnabled}
                    onChange={(e) =>
                      patch(project.id, { alertsEnabled: e.target.checked }).catch(
                        (err) =>
                          setError(err instanceof Error ? err.message : "Update failed")
                      )
                    }
                  />
                </label>
              </div>
              {project.onCooldown && project.alertsCooldownUntil ? (
                <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Cooling down until {formatCooldown(project.alertsCooldownUntil)}.
                  We will start checking this project again then, with a fresh
                  alert count.
                </p>
              ) : null}
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <OutlinedField label="Max alerts" hint={HINTS.maxAlerts}>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    className="w-full bg-transparent py-1.5 text-sm outline-none"
                    defaultValue={project.maxAlertCount}
                    key={`${project.id}-max-${project.maxAlertCount}`}
                    onChange={(e) => {
                      e.target.value = String(clampInt(e.target.value, 1, 12));
                    }}
                    onBlur={(e) => {
                      const value = clampInt(e.target.value, 1, 12);
                      e.target.value = String(value);
                      if (value !== project.maxAlertCount) {
                        patch(project.id, { maxAlertCount: value }).catch((err) =>
                          setError(err instanceof Error ? err.message : "Update failed")
                        );
                      }
                    }}
                  />
                </OutlinedField>
                <OutlinedField label="Cooldown hours" hint={HINTS.cooldownHours}>
                  <input
                    type="number"
                    min={1}
                    max={72}
                    className="w-full bg-transparent py-1.5 text-sm outline-none"
                    defaultValue={project.alertCooldownHours ?? 3}
                    key={`${project.id}-cd-${project.alertCooldownHours ?? 3}`}
                    onChange={(e) => {
                      e.target.value = String(clampInt(e.target.value, 1, 72));
                    }}
                    onBlur={(e) => {
                      const value = clampInt(e.target.value, 1, 72);
                      e.target.value = String(value);
                      if (value !== project.alertCooldownHours) {
                        patch(project.id, { alertCooldownHours: value }).catch((err) =>
                          setError(err instanceof Error ? err.message : "Update failed")
                        );
                      }
                    }}
                  />
                </OutlinedField>
                <OutlinedField label="Alerts left this round" hint={HINTS.remaining}>
                  <input
                    readOnly
                    className="w-full cursor-default bg-transparent py-1.5 text-sm text-zinc-700 outline-none"
                    value={project.remainingAlerts}
                    tabIndex={-1}
                  />
                </OutlinedField>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <button
                  className="rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-50"
                  disabled={testingId === project.id}
                  onClick={() => testNow(project.id)}
                >
                  {testingId === project.id ? "Testing…" : "Test now"}
                </button>
                <button
                  className="rounded px-3 py-1 text-red-700 hover:bg-red-50"
                  onClick={() =>
                    remove(project.id).catch((err) =>
                      setError(err instanceof Error ? err.message : "Delete failed")
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
