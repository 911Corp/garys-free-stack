/** localStorage with try/catch: storage can be missing, full or blocked. State is per browser only. */
const NS = 'gfs:';
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    /* ignore: private mode or quota */
  }
}
