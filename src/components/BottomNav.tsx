import { Home, Trophy, Settings, type LucideIcon } from 'lucide-react';
import { useNav, type RouteName } from '@/store/navigation';

const tabs: { name: Extract<RouteName, 'home' | 'badges' | 'settings'>; icon: LucideIcon; label: string }[] = [
  { name: 'home', icon: Home, label: 'Accueil' },
  { name: 'badges', icon: Trophy, label: 'Récompenses' },
  { name: 'settings', icon: Settings, label: 'Réglages' },
];

/** Barre de navigation basse (style app mobile). */
export function BottomNav() {
  const { route, navigate } = useNav();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-night-900/90 backdrop-blur">
      <div
        className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {tabs.map((tab) => {
          const active = route.name === tab.name;
          const Icon = tab.icon;
          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => navigate({ name: tab.name })}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1 transition-colors ${
                active ? 'text-brand-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
