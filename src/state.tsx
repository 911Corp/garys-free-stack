import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { load, save } from './core/storage';
import type { Stack } from './core/stack';

export interface SavedStack { id: string; savedAt: string; stack: Stack }
interface AppState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  setCompare: (ids: string[]) => void;
  saved: SavedStack[];
  saveStack: (s: Stack) => void;
  deleteStack: (id: string) => void;
  history: string[];
  pushHistory: (id: string) => void;
  clearHistory: () => void;
  toast: (msg: string) => void;
}
const Ctx = createContext<AppState | null>(null);
export const MAX_COMPARE = 4;

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFav] = useState<string[]>(() => load('favorites', []));
  const [compare, setCmp] = useState<string[]>(() => load('compare', []));
  const [saved, setSaved] = useState<SavedStack[]>(() => load('stacks', []));
  const [history, setHist] = useState<string[]>(() => load('history', []));
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => save('favorites', favorites), [favorites]);
  useEffect(() => save('compare', compare), [compare]);
  useEffect(() => save('stacks', saved), [saved]);
  useEffect(() => save('history', history), [history]);

  const toast = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2200);
  }, []);
  const value = useMemo<AppState>(() => ({
    favorites,
    toggleFavorite: (id) => setFav((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
    compare,
    toggleCompare: (id) => setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? c : [...c, id])),
    setCompare: (ids) => setCmp(ids.slice(0, MAX_COMPARE)),
    saved,
    saveStack: (s) => setSaved((list) => [{ id: Math.random().toString(36).slice(2, 10), savedAt: new Date().toISOString(), stack: s }, ...list].slice(0, 50)),
    deleteStack: (id) => setSaved((list) => list.filter((x) => x.id !== id)),
    history,
    pushHistory: (id) => setHist((h) => [id, ...h.filter((x) => x !== id)].slice(0, 30)),
    clearHistory: () => setHist([]),
    toast,
  }), [favorites, compare, saved, history, toast]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </Ctx.Provider>
  );
}
export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp outside provider');
  return c;
}
