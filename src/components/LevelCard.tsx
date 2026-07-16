import { ChevronRight, Lock } from 'lucide-react';
import type { Level } from '@/types';

interface LevelCardProps {
  level: Level;
  verbCount: number;
  /** Nombre de verbes maîtrisés (0 pour l'instant, branché à l'étape suivante). */
  masteredCount: number;
  locked: boolean;
  onClick?: () => void;
}

/** Carte d'un niveau sur l'écran d'accueil (barre de progression + état). */
export function LevelCard({ level, verbCount, masteredCount, locked, onClick }: LevelCardProps) {
  const progress = verbCount > 0 ? Math.round((masteredCount / verbCount) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:bg-white/10 enabled:active:translate-y-0 disabled:opacity-60"
    >
      {/* Pastille emoji colorée */}
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-lg"
        style={{ backgroundColor: `${level.accent}22`, boxShadow: `0 8px 24px ${level.accent}22` }}
      >
        {locked ? <Lock size={22} className="text-slate-400" /> : <span>{level.emoji}</span>}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Niveau {level.order}
          </span>
          {!locked && progress === 100 && (
            <span className="rounded-full bg-[color:var(--color-correct)]/20 px-2 py-0.5 text-[10px] font-bold text-[color:var(--color-correct)]">
              Maîtrisé
            </span>
          )}
        </div>
        <h3 className="truncate text-base font-extrabold text-white">{level.title}</h3>
        <p className="truncate text-xs text-slate-400">{level.subtitle}</p>

        {!locked && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: level.accent }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-bold text-slate-300">
              {masteredCount}/{verbCount}
            </span>
          </div>
        )}
      </div>

      {!locked && (
        <ChevronRight
          size={22}
          className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white"
        />
      )}
    </button>
  );
}
