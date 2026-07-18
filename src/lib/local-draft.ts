const MAX_DRAFT_BYTES = 200_000;

type DraftEnvelope<T> = {
  version: number;
  savedAt: number;
  value: T;
};

export function readLocalDraft<T>(key: string, version: number, maxAgeMs: number): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    if (raw.length > MAX_DRAFT_BYTES) {
      window.localStorage.removeItem(key);
      return null;
    }
    const envelope = JSON.parse(raw) as Partial<DraftEnvelope<T>>;
    if (
      envelope.version !== version ||
      typeof envelope.savedAt !== "number" ||
      Date.now() - envelope.savedAt > maxAgeMs ||
      envelope.value === undefined
    ) {
      window.localStorage.removeItem(key);
      return null;
    }
    return envelope.value;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function writeLocalDraft<T>(key: string, version: number, value: T) {
  try {
    const serialized = JSON.stringify({
      version,
      savedAt: Date.now(),
      value,
    } satisfies DraftEnvelope<T>);
    if (serialized.length > MAX_DRAFT_BYTES) return false;
    window.localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function removeLocalDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in privacy modes; clearing is best-effort.
  }
}
