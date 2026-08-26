import { ALERT_FROM_NUMBER_DISPLAY } from "@/lib/constants";

export function AlertNumberBanner() {
  return (
    <div className="rounded-2xl border border-hs-line bg-white p-5 shadow-card">
      <p className="text-sm font-semibold text-hs-ink">Save our alert number</p>
      <p className="mt-2 text-sm leading-relaxed text-hs-muted">
        Task alerts come from our verified toll-free number. Add it to your
        contacts so you recognize texts from Handshake Alerts.
      </p>
      <p className="mt-4 inline-flex items-center rounded-full border border-hs-line bg-hs-bg px-4 py-2 text-base font-semibold tracking-tight text-hs-ink">
        {ALERT_FROM_NUMBER_DISPLAY}
      </p>
    </div>
  );
}
