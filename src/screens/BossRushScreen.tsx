import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Home, Swords, Timer, X, Zap } from 'lucide-react';
import type { FormKey, Verb } from '@/types';
import { allVerbs } from '@/data/verbs';
import { useProfile } from '@/store/profile';
import { useNav } from '@/store/navigation';
import { canonicalForm, isFormCorrect } from '@/lib/grading';
import { BOSS_DURATION_SEC, BOSS_MAX_HP } from '@/lib/constants';
import { BossHealthBar } from '@/components/BossHealthBar';

type Phase = 'ready' | 'playing' | 'over';
interface BossQuestion {
  verb: Verb;
  form: FormKey;
}

const BOSS_EMOJIS = ['👹', '🐉', '👾', '🧟', '🤖', '👻'];
const formLabel: Record<FormKey, string> = {
  base: 'Infinitif',
  preterite: 'Prétérit',
  pastParticiple: 'Participe passé',
};

export function BossRushScreen() {
  const { profile, recordBossScore } = useProfile();
  const { navigate } = useNav();

  // Tous les verbes disponibles (tous les niveaux sont accessibles).
  const pool = allVerbs;
  const prevBestRef = useRef(profile.stats.bestBossScore);
  const finalizedRef = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase, setPhase] = useState<Phase>('ready');
  const [timeLeft, setTimeLeft] = useState(BOSS_DURATION_SEC);
  const [maxHp, setMaxHp] = useState(BOSS_MAX_HP);
  const [hp, setHp] = useState(BOSS_MAX_HP);
  const [bossesDefeated, setBossesDefeated] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [question, setQuestion] = useState<BossQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; expected: string } | null>(null);

  const pickQuestion = useCallback(
    (prev?: Verb): BossQuestion => {
      let verb = pool[Math.floor(Math.random() * pool.length)]!;
      if (pool.length > 1 && prev) {
        while (verb.id === prev.id) verb = pool[Math.floor(Math.random() * pool.length)]!;
      }
      const form: FormKey = Math.random() < 0.5 ? 'preterite' : 'pastParticiple';
      return { verb, form };
    },
    [pool],
  );

  const start = () => {
    setPhase('playing');
    setTimeLeft(BOSS_DURATION_SEC);
    setMaxHp(BOSS_MAX_HP);
    setHp(BOSS_MAX_HP);
    setBossesDefeated(0);
    setScore(0);
    setCombo(0);
    setFeedback(null);
    setAnswer('');
    finalizedRef.current = false;
    setQuestion(pickQuestion());
  };

  // Chrono
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Fin du temps
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0 && !finalizedRef.current) {
      finalizedRef.current = true;
      setPhase('over');
      recordBossScore(score);
    }
  }, [phase, timeLeft, score, recordBossScore]);

  // Nettoyage du timer de feedback
  useEffect(() => () => void (feedbackTimer.current && clearTimeout(feedbackTimer.current)), []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== 'playing' || !question) return;
    const correct = isFormCorrect(question.verb, question.form, answer);

    if (correct) {
      setScore((s) => s + 1);
      setCombo((c) => c + 1);
      setHp((current) => {
        const next = current - 1;
        if (next <= 0) {
          // Boss vaincu -> nouveau boss plus résistant
          setBossesDefeated((b) => b + 1);
          const newMax = maxHp + 2;
          setMaxHp(newMax);
          return newMax;
        }
        return next;
      });
      setFeedback({ correct: true, expected: canonicalForm(question.verb, question.form) });
    } else {
      setCombo(0);
      setFeedback({ correct: false, expected: canonicalForm(question.verb, question.form) });
    }

    setAnswer('');
    setQuestion(pickQuestion(question.verb));

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 800);
  }

  /* ----------------------------- Rendus ----------------------------- */

  if (phase === 'ready') {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="anim-floaty text-7xl">👹</div>
        <h1 className="text-3xl font-black text-white">Boss Rush</h1>
        <p className="max-w-xs text-sm text-slate-400">
          {BOSS_DURATION_SEC} secondes pour infliger un maximum de dégâts. Chaque bonne réponse fait
          tomber la vie du boss. Prêt·e&nbsp;?
        </p>
        <button
          type="button"
          onClick={start}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-[#7c3aed] px-8 py-4 text-lg font-black text-white shadow-xl transition-transform active:scale-[0.98]"
        >
          <Swords size={22} /> Combattre
        </button>
        <button
          type="button"
          onClick={() => navigate({ name: 'home' })}
          className="text-sm font-bold text-slate-500 hover:text-slate-300"
        >
          Retour
        </button>
      </div>
    );
  }

  if (phase === 'over') {
    const isRecord = score > prevBestRef.current;
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="anim-pop text-7xl">{isRecord ? '🏅' : '💥'}</div>
        <h1 className="text-2xl font-black text-white">Temps écoulé&nbsp;!</h1>
        {isRecord && <p className="font-bold text-amber-300">Nouveau record&nbsp;!</p>}
        <div className="mt-2 grid w-full grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-2xl font-black text-white">{score}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Coups</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-2xl font-black text-white">{bossesDefeated}</div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Boss</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-2xl font-black text-amber-300">
              {Math.max(prevBestRef.current, score)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Record</div>
          </div>
        </div>
        <div className="mt-6 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={start}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-sm font-black text-white shadow-lg transition-transform active:scale-[0.98]"
          >
            <Swords size={18} /> Rejouer
          </button>
          <button
            type="button"
            onClick={() => navigate({ name: 'home' })}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 text-sm font-black text-white transition-transform active:scale-[0.98]"
          >
            <Home size={18} /> Accueil
          </button>
        </div>
      </div>
    );
  }

  // phase === 'playing'
  const verb = question!.verb;
  const form = question!.form;
  const emoji = BOSS_EMOJIS[bossesDefeated % BOSS_EMOJIS.length];

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-8 pt-6">
      {/* Barre supérieure : quitter, chrono, combo */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate({ name: 'home' })}
          aria-label="Quitter"
          className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X size={22} />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 font-black text-white ring-1 ring-white/10">
          <Timer size={18} className={timeLeft <= 10 ? 'text-rose-400' : 'text-brand-300'} />
          <span className={timeLeft <= 10 ? 'text-rose-400' : ''}>{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-1 font-black text-amber-300">
          <Zap size={18} fill="currentColor" />
          {combo}
        </div>
      </div>

      {/* Boss + barre de vie */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-night-800 to-night-900 p-5 ring-1 ring-white/10">
        <div className="mb-3 text-center text-6xl">
          <span className={feedback?.correct ? 'anim-shake inline-block' : 'anim-floaty inline-block'}>
            {emoji}
          </span>
        </div>
        <BossHealthBar hp={hp} maxHp={maxHp} />
      </div>

      {/* Question : une seule forme demandée */}
      <div className="mb-4 rounded-3xl bg-white/5 p-5 text-center ring-1 ring-white/10">
        <div className="text-[11px] font-bold uppercase tracking-wide text-brand-300">
          {formLabel[form]} de…
        </div>
        <div className="mt-1 text-2xl font-black text-white">to {verb.base}</div>
        <div className="text-sm font-semibold text-brand-200">{verb.translation}</div>
      </div>

      <form onSubmit={submit}>
        <input
          key={`${verb.id}-${form}-${score}-${combo}`}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          placeholder="Réponse…"
          className="w-full rounded-2xl bg-night-800 px-4 py-3 text-center text-lg font-bold text-white outline-none ring-2 ring-white/10 transition placeholder:text-slate-600 focus:ring-brand-400"
        />
        <button
          type="submit"
          className="mt-3 w-full rounded-2xl bg-brand-500 py-3.5 text-base font-black text-white shadow-lg transition-transform active:scale-[0.98]"
        >
          Frapper&nbsp;!
        </button>
      </form>

      {/* Feedback éclair (non bloquant) */}
      <div className="mt-3 h-6 text-center text-sm font-bold">
        {feedback &&
          (feedback.correct ? (
            <span className="inline-flex items-center gap-1 text-[color:var(--color-correct)]">
              <Check size={16} /> Touché&nbsp;!
            </span>
          ) : (
            <span className="text-[color:var(--color-wrong)]">
              Raté&nbsp;: <span className="font-black">{feedback.expected}</span>
            </span>
          ))}
      </div>
    </div>
  );
}
