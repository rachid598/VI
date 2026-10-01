import { BookOpen, ChevronRight } from 'lucide-react';

interface PracticeCardProps {
  title: string;
  subtitle: string;
  /** Nombre de verbes ouverts. */
  verbCount: number;
  /** Nombre de verbes maîtrisés (3 succès d'affilée). */
  masteredCount: number;
  onClick: () => void;
}

/** Carte principale de l'accueil : lance l'entraînement sur les verbes ouverts. */
export function PracticeCard({
  title,
  subtitle,
  verbCount,
  masteredCount,
  onClick,
}: PracticeCardProps) {
  const progress = verbCount > 0 ? Math.round((masteredCount / verbCount) * 100) : 0;
  const done = verbCount > 0 && masteredCount >= verbCount;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={verbCount === 0}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:bg-white/10 enabled:active:translate-y-0 disabled:opacity-60"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-500/20 shadow-lg">
        <BookOpen size={26} className="text-brand-300" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Entraînement
          </span>
          {done && (
            <span className="rounded-full bg-[color:var(--color-correct)]/20 px-2 py-0.5 text-[10px] font-bold text-[color:var(--color-correct)]">
              Maîtrisé
            </span>
          )}
        </div>
        <h3 className="truncate text-base font-extrabold text-white">{title}</h3>
        <p className="truncate text-xs text-slate-400">{subtitle}</p>

        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-[#8b5cf6] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-bold text-slate-300">
            {masteredCount}/{verbCount}
          </span>
        </div>
      </div>

      <ChevronRight
        size={22}
        className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white"
      />
    </button>
  );
}
