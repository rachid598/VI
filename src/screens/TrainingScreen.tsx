import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import type { FormAnswer, FormKey, GradedAnswer, LevelId, TrainingSession } from '@/types';
import { allVerbs } from '@/data/verbs';
import { levels, levelsById } from '@/data/levels';
import { useProfile } from '@/store/profile';
import { useNav } from '@/store/navigation';
import { createSession, currentQuestion, submitAnswer } from '@/lib/session';
import { formsForPrompt } from '@/lib/grading';
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

/** Nombre de verbes tirés en mode « révision mélangée ». */
const REVISION_SIZE = 15;

// Pas d'exemple en filigrane : « ex. went / gone » révélait la réponse du verbe « go ».
const FIELD: Record<FormKey, { label: string }> = {
  base: { label: 'Infinitif' },
  preterite: { label: 'Prétérit (past simple)' },
  pastParticiple: { label: 'Participe passé' },
};

const emptyAnswers = (): Record<FormKey, string> => ({ base: '', preterite: '', pastParticiple: '' });

interface TrainingScreenProps {
  source: LevelId | 'revision';
}

export function TrainingScreen({ source }: TrainingScreenProps) {
  const { profile, answer, completeLevel } = useProfile();
  const { navigate } = useNav();

  const isRevision = source === 'revision';
  // Mode expert : n'afficher que le français, deviner les 3 formes.
  const prompted = profile.settings.guessInfinitive ? 'all' : 'both';
  const sessionVerbs = useMemo(
    () => (isRevision ? allVerbs : allVerbs.filter((v) => v.levelId === source)),
    [isRevision, source],
  );
  const title = isRevision ? 'Révision mélangée' : (levelsById[source]?.title ?? 'Entraînement');

  const buildSession = () =>
    createSession(source, sessionVerbs, {
      prompted,
      progress: profile.progress,
      shuffle: isRevision,
      ...(isRevision ? { size: REVISION_SIZE } : {}),
    });

  const startXpRef = useRef(profile.xp);
  const finalizedRef = useRef(false);
  const nextSessionRef = useRef<TrainingSession | null>(null);
  const continueBtnRef = useRef<HTMLButtonElement>(null);

  const [session, setSession] = useState<TrainingSession>(buildSession);
  const [inputs, setInputs] = useState<Record<FormKey, string>>(emptyAnswers);
  const [graded, setGraded] = useState<GradedAnswer | null>(null);

  const question = currentQuestion(session);

  // À la fin : bonus « sans-faute » + déblocage (uniquement pour un vrai niveau).
  useEffect(() => {
    if (session.finished && !finalizedRef.current) {
      finalizedRef.current = true;
      if (source !== 'revision') {
        completeLevel(session.perfect, nextLevelWithContent(source));
      }
    }
  }, [session.finished, session.perfect, source, completeLevel]);

  // Quand la correction s'affiche, on met le focus sur « Continuer » (Entrée).
  useEffect(() => {
    if (graded) continueBtnRef.current?.focus();
  }, [graded]);

  function restart() {
    startXpRef.current = profile.xp;
    finalizedRef.current = false;
    nextSessionRef.current = null;
    setSession(buildSession());
    setGraded(null);
    setInputs(emptyAnswers());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (graded) {
      const next = nextSessionRef.current;
      if (!next) return;
      setSession(next);
      setGraded(null);
      setInputs(emptyAnswers());
      nextSessionRef.current = null;
      return;
    }
    if (!question) return;
    const res = submitAnswer(session, inputs as FormAnswer);
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
        levelTitle={title}
        onReplay={restart}
        onHome={() => navigate({ name: 'home' })}
      />
    );
  }

  if (!question) return null;

  const { verb } = question;
  const askedForms = formsForPrompt(question.prompted);
  const guessBase = question.prompted === 'all';

  const statusFor = (form: FormKey): FieldStatus => {
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
        {guessBase ? (
          <>
            Trouve l'<span className="text-brand-300">infinitif</span>, le{' '}
            <span className="text-brand-300">prétérit</span> et le{' '}
            <span className="text-brand-300">participe passé</span>.
          </>
        ) : (
          <>
            Écris le <span className="text-brand-300">prétérit</span> et le{' '}
            <span className="text-brand-300">participe passé</span>.
          </>
        )}
      </p>

      {/* Carte du verbe */}
      <div className="mb-6 rounded-3xl bg-white/5 p-6 text-center ring-1 ring-white/10">
        {guessBase ? (
          // Mode expert : seulement le français
          <>
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Verbe français
            </div>
            <div className="mt-1 text-3xl font-black text-brand-200">{verb.translation}</div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Formulaire : un champ par forme demandée */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {askedForms.map((form, index) => (
          <FormField
            key={`${form}-${session.position}`}
            label={FIELD[form].label}
            value={inputs[form]}
            onChange={(value) => setInputs((prev) => ({ ...prev, [form]: value }))}
            status={statusFor(form)}
            disabled={graded !== null}
            autoFocus={index === 0}
          />
        ))}

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
