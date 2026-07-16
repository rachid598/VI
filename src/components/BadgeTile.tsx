import { Lock } from 'lucide-react';
import type { BadgeDefinition } from '@/types';

interface BadgeTileProps {
  badge: BadgeDefinition;
  unlocked: boolean;
}

/** Vignette d'un badge dans la collection (grisée si verrouillé). */
export function BadgeTile({ badge, unlocked }: BadgeTileProps) {
  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl p-4 text-center ring-1 transition ${
        unlocked ? 'bg-white/10 ring-white/20' : 'bg-white/5 ring-white/10'
      }`}
    >
      <div className={`text-4xl ${unlocked ? 'anim-floaty' : 'opacity-40 grayscale'}`}>
        {badge.emoji}
      </div>
      <div className={`mt-2 text-sm font-black ${unlocked ? 'text-white' : 'text-slate-500'}`}>
        {badge.label}
      </div>
      <div className="mt-0.5 text-[11px] leading-tight text-slate-400">{badge.description}</div>
      {!unlocked && (
        <div className="absolute right-2 top-2 text-slate-500">
          <Lock size={14} />
        </div>
      )}
    </div>
  );
}
