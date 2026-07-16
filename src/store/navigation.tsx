import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LevelId } from '@/types';

/** Navigation simple entre écrans (pas de router externe pour une PWA légère). */
export type Route =
  | { name: 'home' }
  | { name: 'training'; levelId: LevelId }
  | { name: 'boss' }
  | { name: 'badges' }
  | { name: 'settings' };

export type RouteName = Route['name'];

interface NavValue {
  route: Route;
  navigate: (route: Route) => void;
}

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const value = useMemo(() => ({ route, navigate: setRoute }), [route]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav doit être utilisé à l’intérieur de <NavProvider>.');
  return ctx;
}
