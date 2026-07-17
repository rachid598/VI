import { BookOpen, GraduationCap, type LucideIcon } from 'lucide-react';

interface ModeSelectorProps {
  /** true = mode expert (deviner l'infinitif). */
  value: boolean;
  onChange: (expert: boolean) => void;
}

const options: { expert: boolean; icon: LucideIcon; label: string; hint: string }[] = [
  { expert: false, icon: BookOpen, label: 'Facile', hint: 'Infinitif donné' },
  { expert: true, icon: GraduationCap, label: 'Expert', hint: 'Français seul' },
];

/** Sélecteur segmenté du mode d'entraînement (Facile / Expert). */
export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
      {options.map((o) => {
        const active = o.expert === value;
        const Icon = o.icon;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.expert)}
            className={`flex flex-col items-center gap-0.5 rounded-xl py-2.5 transition-colors ${
              active ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5 text-sm font-black">
              <Icon size={16} /> {o.label}
            </span>
            <span
              className={`text-[10px] font-semibold ${active ? 'text-brand-100' : 'text-slate-500'}`}
            >
              {o.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
