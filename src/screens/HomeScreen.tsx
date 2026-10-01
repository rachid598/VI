import { Flame, Zap, Trophy, Swords, Shuffle, ChevronRight } from 'lucide-react';
import { StatPill } from '@/components/StatPill';
import { PracticeCard } from '@/components/PracticeCard';
import { ModeSelector } from '@/components/ModeSelector';
import { activeVerbs } from '@/data/curriculum';
import { useProfile } from '@/store/profile';
import { useNav } from '@/store/navigation';
import { masteredCount, studentLevel } from '@/lib/profile';

/**
 * Écran d'accueil, branché sur l'état réel (`useProfile`).
 * Les élèves ne voient et ne travaillent que les verbes ouverts
 * par l'enseignant (data/curriculum.ts).
 */
export function HomeScreen() {
  const { profile, updateSettings } = useProfile();
  const { navigate } = useNav();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-28 pt-6">
      {/* En-tête : stats de gamification (données réelles) */}
      <header className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-[#8b5cf6] shadow-lg">
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-black tracking-tight text-white">Verbes Héros</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Niveau {studentLevel(profile.xp)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatPill icon={Flame} value={profile.streak.current} label="Flamme" color="#f97316" />
          <StatPill icon={Trophy} value={profile.xp} label="XP" color="#facc15" />
        </div>
      </header>

      {/* Bannière Boss Rush */}
      <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-[#7c3aed] p-5 shadow-xl ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <Swords size={28} className="text-white" />
          <div className="flex-1">
            <h2 className="text-lg font-black text-white">Boss Rush</h2>
            <p className="text-xs text-brand-100">
              60 secondes pour vaincre le boss. Enchaîne les bonnes réponses&nbsp;!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate({ name: 'boss' })}
          disabled={activeVerbs.length === 0}
          className="mt-4 w-full rounded-2xl bg-white/95 py-3 text-sm font-black text-brand-700 shadow-md transition-transform active:scale-[0.98]"
        >
          Lancer un défi
        </button>
      </section>

      {/* Sélecteur de mode d'entraînement */}
      <div className="mb-6">
        <h2 className="mb-2 px-1 text-sm font-black uppercase tracking-wider text-slate-400">
          Mode d'entraînement
        </h2>
        <ModeSelector
          value={profile.settings.guessInfinitive}
          onChange={(expert) => updateSettings({ guessInfinitive: expert })}
        />
      </div>

      {/* Entraînement sur les verbes de la leçon */}
      <section className="flex flex-col gap-3">
        <h2 className="px-1 text-sm font-black uppercase tracking-wider text-slate-400">
          Mes verbes
        </h2>
        <PracticeCard
          title="Verbes de la leçon"
          subtitle={`${activeVerbs.length} verbes à retenir`}
          verbCount={activeVerbs.length}
          masteredCount={masteredCount(profile, activeVerbs)}
          onClick={() => navigate({ name: 'training', source: 'training' })}
        />

        {/* Révision mélangée : mêmes verbes, dans le désordre */}
        <button
          type="button"
          onClick={() => navigate({ name: 'training', source: 'revision' })}
          disabled={activeVerbs.length === 0}
          className="flex w-full items-center gap-3 rounded-3xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:bg-white/10 disabled:opacity-60"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15">
            <Shuffle size={22} className="text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-white">Révision mélangée</h3>
            <p className="truncate text-xs text-slate-400">Les mêmes verbes, dans le désordre.</p>
          </div>
          <ChevronRight size={22} className="shrink-0 text-slate-500" />
        </button>
      </section>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-500">
        Un peu chaque jour et les verbes irréguliers n'auront plus de secrets&nbsp;! 💪
      </p>
    </div>
  );
}
