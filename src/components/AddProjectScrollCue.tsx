"use client";

import { useEffect, useState } from "react";

/** max-w-5xl = 64rem. Cue needs this much free left gutter to avoid overlapping cards. */
const CONTENT_MAX_PX = 64 * 16;
const MIN_GUTTER_PX = 200;

function leftGutterWideEnough() {
  if (typeof window === "undefined") return false;
  const gutter = Math.max(0, (window.innerWidth - CONTENT_MAX_PX) / 2);
  return gutter >= MIN_GUTTER_PX;
}

function addProjectMidInView() {
  const el = document.getElementById("add-project");
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const midY = rect.top + rect.height / 2;
  return midY >= 0 && midY <= window.innerHeight;
}

export function AddProjectScrollCue() {
  const [gutterOk, setGutterOk] = useState(false);
  const [atAddProject, setAtAddProject] = useState(false);

  useEffect(() => {
    const update = () => {
      setGutterOk(leftGutterWideEnough());
      setAtAddProject(addProjectMidInView());
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!gutterOk || atAddProject) return null;

  return (
    <a
      href="#add-project"
      className="fixed z-20 flex w-max max-w-[11rem] -translate-x-1/2 flex-col items-center gap-2 text-center"
      style={{
        left: "max(3.5rem, calc((100vw - 64rem) / 4))",
        bottom: "12vh",
      }}
      aria-label="Scroll to add a project"
    >
      <span className="text-sm font-semibold leading-snug tracking-tight text-hs-ink md:text-base">
        Scroll down to add a project
      </span>
      <span
        aria-hidden="true"
        className="animate-hs-bounce-y text-3xl font-semibold leading-none text-hs-ink"
      >
        ↓
      </span>
    </a>
  );
}
