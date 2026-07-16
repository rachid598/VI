import { Home, RotateCcw, Trophy } from 'lucide-react';

interface SessionSummaryProps {
  perfect: boolean;
  correct: number;
  total: number;
  xpGained: number;
  levelTitle: string;
  onReplay: () => void;
  onHome: () => void;
}

/** Écran de fin de session d'entraînement (récap + XP gagnée). */
export function SessionSummary({
  perfect,
  correct,
  total,
  xpGained,
  levelTitle,
  onReplay,
  onHome,
}: SessionSummaryProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <div className="anim-pop text-7xl">{perfect ? '🏆' : '🎉'}</div>
      <h1 className="mt-4 text-2xl font-black text-white">
        {perfect ? 'Sans faute !' : 'Bien joué !'}
      </h1>
      <p className="mt-1 text-sm text-slate-400">{levelTitle}</p>

      <div className="mt-8 grid w-full grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="text-2xl font-black text-white">{accuracy}%</div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Réussite</div>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="text-2xl font-black text-white">
            {correct}/{total}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Bonnes</div>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-300">
            <Trophy size={18} />+{xpGained}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">XP</div>
        </div>
      </div>

      <div className="mt-10 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-sm font-black text-white shadow-lg transition-transform active:scale-[0.98]"
        >
          <RotateCcw size={18} /> Rejouer ce niveau
        </button>
        <button
          type="button"
          onClick={onHome}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 text-sm font-black text-white transition-transform active:scale-[0.98]"
        >
          <Home size={18} /> Accueil
        </button>
      </div>
    </div>
  );
}
