import { Flame, Zap, Trophy, Swords, Shuffle, ChevronRight } from 'lucide-react';
import { StatPill } from '@/components/StatPill';
import { LevelCard } from '@/components/LevelCard';
import { levels } from '@/data/levels';
import { allVerbs } from '@/data/verbs';
import { useProfile } from '@/store/profile';
import { useNav } from '@/store/navigation';
import { masteredCountForLevel, studentLevel } from '@/lib/profile';
import type { LevelId } from '@/types';

/**
 * Écran d'accueil, branché sur l'état réel (`useProfile`).
 * Les valeurs (XP, flamme, verbes maîtrisés) proviennent du profil persisté.
 */
export function HomeScreen() {
  const { profile } = useProfile();
  const { navigate } = useNav();

  const verbCountByLevel = (id: LevelId) => allVerbs.filter((verb) => verb.levelId === id).length;

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
          className="mt-4 w-full rounded-2xl bg-white/95 py-3 text-sm font-black text-brand-700 shadow-md transition-transform active:scale-[0.98]"
        >
          Lancer un défi
        </button>
      </section>

      {/* Révision mélangée : pioche dans tous les niveaux */}
      <button
        type="button"
        onClick={() => navigate({ name: 'training', source: 'revision' })}
        className="mb-6 flex w-full items-center gap-3 rounded-3xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15">
          <Shuffle size={22} className="text-emerald-300" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold text-white">Révision mélangée</h3>
          <p className="truncate text-xs text-slate-400">Un mix de verbes de tous les niveaux.</p>
        </div>
        <ChevronRight size={22} className="shrink-0 text-slate-500" />
      </button>

      {/* Parcours de niveaux */}
      <section className="flex flex-col gap-3">
        <h2 className="px-1 text-sm font-black uppercase tracking-wider text-slate-400">Parcours</h2>
        {levels.map((level) => {
          const count = verbCountByLevel(level.id);
          // Tous les niveaux disposant de verbes sont accessibles directement.
          return (
            <LevelCard
              key={level.id}
              level={level}
              verbCount={count}
              masteredCount={masteredCountForLevel(profile, allVerbs, level.id)}
              locked={count === 0}
              onClick={() => navigate({ name: 'training', source: level.id })}
            />
          );
        })}
      </section>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-500">
        Un peu chaque jour et les verbes irréguliers n'auront plus de secrets&nbsp;! 💪
      </p>
    </div>
  );
}
