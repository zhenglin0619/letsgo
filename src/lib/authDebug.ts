// Lightweight breadcrumb trail for the auth bootstrap flow, persisted to
// localStorage so it survives the freeze/reload cycle we're chasing — the
// bug only reproduces after a tab sits idle for hours, so there's no live
// DevTools session to inspect when it actually happens.
const KEY = 'auth-debug-log';
const MAX_ENTRIES = 30;

export function logAuthEvent(msg: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const log: string[] = raw ? JSON.parse(raw) : [];
    log.push(`${new Date().toISOString()} ${msg}`);
    while (log.length > MAX_ENTRIES) log.shift();
    localStorage.setItem(KEY, JSON.stringify(log));
  } catch { /* ignore storage errors */ }
}

export function getAuthDebugLog(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
