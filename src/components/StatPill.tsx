import type { LucideIcon } from 'lucide-react';

interface StatPillProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  /** Couleur de l'icône (hex ou token). */
  color?: string;
}

/** Petite pastille de statistique affichée dans l'en-tête (XP, flamme…). */
export function StatPill({ icon: Icon, value, label, color = '#818cf8' }: StatPillProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <Icon size={20} style={{ color }} aria-hidden />
      <div className="leading-tight">
        <div className="text-sm font-extrabold text-white">{value}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}
