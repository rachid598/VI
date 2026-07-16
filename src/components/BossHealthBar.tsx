import { Heart } from 'lucide-react';

interface BossHealthBarProps {
  hp: number;
  maxHp: number;
}

/** Barre de vie du boss (descend à chaque bonne réponse). */
export function BossHealthBar({ hp, maxHp }: BossHealthBarProps) {
  const pct = maxHp > 0 ? Math.max(0, (hp / maxHp) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <Heart size={18} className="shrink-0 text-rose-400" fill="currentColor" />
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-black text-white">
        {Math.max(0, hp)}/{maxHp}
      </span>
    </div>
  );
}
