// Centralized cookie-consent state.
//
// Design contract:
// - Nothing beyond ESSENTIAL cookies loads until the user has EXPLICITLY
//   accepted analytics/advertising. No pre-checked toggles.
// - Consumers subscribe via `subscribeConsent` so an analytics/ads loader
//   can activate the moment the user grants consent (no full page reload).
// - Storage is localStorage; missing/invalid values mean "essential only",
//   never "accepted".
//
// This module is intentionally framework-free so it can be imported by
// component code, ad loaders, and analytics loaders alike.

export const CONSENT_STORAGE_KEY = "epdfs_cookie_consent_v2";

export type ConsentCategory = "essential" | "analytics" | "advertising";

export interface ConsentState {
  /** Essential is always true — required for the site to work. */
  essential: true;
  analytics: boolean;
  advertising: boolean;
  /** Whether the user has made an explicit choice (accept or decline). */
  decided: boolean;
  /** ISO timestamp of the last decision, or null if never decided. */
  decidedAt: string | null;
}

const DEFAULT_STATE: ConsentState = {
  essential: true,
  analytics: false,
  advertising: false,
  decided: false,
  decidedAt: null,
};

type Listener = (state: ConsentState) => void;
const listeners = new Set<Listener>();

function readRaw(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;
    return {
      essential: true,
      analytics: parsed.analytics === true,
      advertising: parsed.advertising === true,
      decided: parsed.decided === true,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function getConsent(): ConsentState {
  return readRaw();
}

export function hasConsent(cat: ConsentCategory): boolean {
  const s = readRaw();
  return s[cat] === true;
}

export function setConsent(next: Partial<Omit<ConsentState, "essential" | "decided" | "decidedAt">>): ConsentState {
  const current = readRaw();
  const state: ConsentState = {
    essential: true,
    analytics: next.analytics ?? current.analytics,
    advertising: next.advertising ?? current.advertising,
    decided: true,
    decidedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* localStorage might be blocked in private mode — non-fatal */
    }
  }
  listeners.forEach((fn) => {
    try { fn(state); } catch { /* ignore listener errors */ }
  });
  return state;
}

export function acceptAll(): ConsentState {
  return setConsent({ analytics: true, advertising: true });
}
export function declineAll(): ConsentState {
  return setConsent({ analytics: false, advertising: false });
}

export function subscribeConsent(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
