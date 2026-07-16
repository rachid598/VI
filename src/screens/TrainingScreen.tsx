import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import type { GradedAnswer, LevelId, TrainingSession } from '@/types';
import { allVerbs } from '@/data/verbs';
import { levels, levelsById } from '@/data/levels';
import { useProfile } from '@/store/profile';
import { useNav } from '@/store/navigation';
import { createSession, currentQuestion, submitAnswer } from '@/lib/session';
import { canSpeak, speak } from '@/lib/speech';
import { ProgressBar } from '@/components/ProgressBar';
import { FormField, type FieldStatus } from '@/components/FormField';
import { FeedbackCard } from '@/components/FeedbackCard';
import { SessionSummary } from '@/screens/SessionSummary';

/** Prochain niveau (par ordre) qui possède réellement des verbes. */
function nextLevelWithContent(levelId: LevelId): LevelId | undefined {
  const order = levelsById[levelId]?.order ?? 0;
  return levels
    .filter((l) => l.order > order && allVerbs.some((v) => v.levelId === l.id))
    .sort((a, b) => a.order - b.order)[0]?.id;
}

interface TrainingScreenProps {
  levelId: LevelId;
}

export function TrainingScreen({ levelId }: TrainingScreenProps) {
  const { profile, answer, completeLevel } = useProfile();
  const { navigate } = useNav();

  const levelVerbs = useMemo(() => allVerbs.filter((v) => v.levelId === levelId), [levelId]);
  const levelTitle = levelsById[levelId]?.title ?? 'Entraînement';

  const startXpRef = useRef(profile.xp);
  const finalizedRef = useRef(false);
  const nextSessionRef = useRef<TrainingSession | null>(null);
  const continueBtnRef = useRef<HTMLButtonElement>(null);

  const [session, setSession] = useState<TrainingSession>(() =>
    createSession(levelId, levelVerbs, { prompted: 'both', progress: profile.progress }),
  );
  const [preterite, setPreterite] = useState('');
  const [pastParticiple, setPastParticiple] = useState('');
  const [graded, setGraded] = useState<GradedAnswer | null>(null);

  const question = currentQuestion(session);

  // Finalise le niveau une seule fois (bonus « sans-faute » + déblocage).
  useEffect(() => {
    if (session.finished && !finalizedRef.current) {
      finalizedRef.current = true;
      completeLevel(session.perfect, nextLevelWithContent(levelId));
    }
  }, [session.finished, session.perfect, levelId, completeLevel]);

  // Quand la correction s'affiche, on met le focus sur « Continuer » (Entrée).
  useEffect(() => {
    if (graded) continueBtnRef.current?.focus();
  }, [graded]);

  function restart() {
    startXpRef.current = profile.xp;
    finalizedRef.current = false;
    nextSessionRef.current = null;
    setSession(createSession(levelId, levelVerbs, { prompted: 'both', progress: profile.progress }));
    setGraded(null);
    setPreterite('');
    setPastParticiple('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (graded) {
      // Passer à la question suivante
      const next = nextSessionRef.current;
      if (!next) return;
      setSession(next);
      setGraded(null);
      setPreterite('');
      setPastParticiple('');
      nextSessionRef.current = null;
      return;
    }
    if (!question) return;
    const res = submitAnswer(session, { preterite, pastParticiple });
    nextSessionRef.current = res.session;
    setGraded(res.graded);
    answer(question.verb, res.graded.correct);
  }

  if (session.finished) {
    return (
      <SessionSummary
        perfect={session.perfect}
        correct={session.correctCount}
        total={session.answeredCount}
        xpGained={Math.max(0, profile.xp - startXpRef.current)}
        levelTitle={levelTitle}
        onReplay={restart}
        onHome={() => navigate({ name: 'home' })}
      />
    );
  }

  if (!question) return null;

  const { verb } = question;
  const statusFor = (form: 'preterite' | 'pastParticiple'): FieldStatus => {
    if (!graded) return 'idle';
    return graded.forms.find((f) => f.form === form)?.correct ? 'correct' : 'wrong';
  };
  const progress = session.totalUnique > 0 ? (session.cleared.length / session.totalUnique) * 100 : 0;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-8 pt-6">
      {/* En-tête : fermer + progression */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ name: 'home' })}
          aria-label="Quitter l'entraînement"
          className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={22} />
        </button>
        <ProgressBar value={progress} />
        <span className="w-12 shrink-0 text-right text-xs font-black text-slate-400">
          {session.cleared.length}/{session.totalUnique}
        </span>
      </div>

      {/* Consigne */}
      <p className="mb-4 text-center text-sm font-semibold text-slate-400">
        Écris le <span className="text-brand-300">prétérit</span> et le{' '}
        <span className="text-brand-300">participe passé</span>.
      </p>

      {/* Carte du verbe */}
      <div className="mb-6 rounded-3xl bg-white/5 p-6 text-center ring-1 ring-white/10">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-black text-white">to {verb.base}</span>
          {profile.settings.sound && canSpeak() && (
            <button
              type="button"
              onClick={() => speak(verb.base)}
              aria-label={`Écouter to ${verb.base}`}
              className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>
        {profile.settings.showPhonetics && verb.phonetics?.base && (
          <div className="mt-1 text-sm text-slate-400">{verb.phonetics.base}</div>
        )}
        <div className="mt-2 text-lg font-semibold text-brand-200">{verb.translation}</div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField
          key={`pret-${session.position}`}
          label="Prétérit (past simple)"
          value={preterite}
          onChange={setPreterite}
          status={statusFor('preterite')}
          disabled={graded !== null}
          placeholder="ex. went"
          autoFocus
        />
        <FormField
          label="Participe passé"
          value={pastParticiple}
          onChange={setPastParticiple}
          status={statusFor('pastParticiple')}
          disabled={graded !== null}
          placeholder="ex. gone"
        />

        {graded && (
          <FeedbackCard
            verb={verb}
            graded={graded}
            showPhonetics={profile.settings.showPhonetics}
            sound={profile.settings.sound}
          />
        )}

        <button
          ref={continueBtnRef}
          type="submit"
          className="mt-2 rounded-2xl bg-brand-500 py-3.5 text-base font-black text-white shadow-lg transition-transform active:scale-[0.98]"
        >
          {graded ? 'Continuer' : 'Valider'}
        </button>
      </form>
    </div>
  );
}
