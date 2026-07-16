import type {
  FormAnswer,
  GradedAnswer,
  LevelId,
  PromptedForm,
  Question,
  TrainingSession,
  Verb,
  VerbProgress,
} from '@/types';
import { gradeAnswer } from './grading';
import { isDue } from './srs';
import { SESSION_REQUEUE_GAP } from './constants';

/**
 * Moteur d'une session d'entraînement (couche transitoire, non persistée).
 * Fonctions PURES : chaque action renvoie une nouvelle session.
 */

interface CreateSessionOptions {
  now?: number;
  size?: number;
  prompted?: PromptedForm;
  progress?: Record<string, VerbProgress>;
  /** Ordre aléatoire (mode « révision mélangée ») plutôt que par fréquence. */
  shuffle?: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

/**
 * Sélectionne les verbes d'une session : ceux « dus » d'abord (répétition
 * espacée), puis les autres — triés par fréquence, ou mélangés si `random`.
 */
export function selectVerbs(
  verbs: Verb[],
  progress: Record<string, VerbProgress>,
  now: number,
  size: number,
  random = false,
): Verb[] {
  const order = (list: Verb[]) =>
    random
      ? shuffleArray(list)
      : list.slice().sort((a, b) => (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999));
  const due = order(verbs.filter((v) => isDue(progress[v.id], now)));
  const rest = order(verbs.filter((v) => !isDue(progress[v.id], now)));
  return [...due, ...rest].slice(0, size);
}

/** Crée une session à partir d'un lot de verbes. */
export function createSession(
  source: LevelId | 'revision',
  verbs: Verb[],
  options: CreateSessionOptions = {},
): TrainingSession {
  const {
    now = Date.now(),
    size = verbs.length,
    prompted = 'both',
    progress = {},
    shuffle = false,
  } = options;
  const chosen = selectVerbs(verbs, progress, now, size, shuffle);
  const queue: Question[] = chosen.map((verb) => ({ verb, prompted }));
  return {
    source,
    queue,
    position: 0,
    answeredCount: 0,
    correctCount: 0,
    cleared: [],
    totalUnique: chosen.length,
    perfect: true,
    finished: chosen.length === 0,
  };
}

/** Question courante (null si la session est terminée). */
export function currentQuestion(session: TrainingSession): Question | null {
  if (session.finished) return null;
  return session.queue[session.position] ?? null;
}

/**
 * Soumet une réponse à la question courante.
 * Un verbe raté est réinséré plus loin dans la file (réapparition rapide)
 * et casse le « sans-faute ».
 */
export function submitAnswer(
  session: TrainingSession,
  answer: FormAnswer,
): { session: TrainingSession; graded: GradedAnswer } {
  const question = session.queue[session.position];
  if (!question) return { session, graded: { verbId: '', correct: false, forms: [] } };

  const graded = gradeAnswer(question, answer);
  const queue = session.queue.slice();
  let perfect = session.perfect;
  let cleared = session.cleared;

  if (graded.correct) {
    // Verbe réussi : il compte pour la progression (une seule fois).
    if (!cleared.includes(question.verb.id)) cleared = [...cleared, question.verb.id];
  } else {
    // Verbe raté : réapparaît un peu plus loin et casse le « sans-faute ».
    perfect = false;
    const insertAt = Math.min(session.position + 1 + SESSION_REQUEUE_GAP, queue.length);
    queue.splice(insertAt, 0, question);
  }

  return {
    session: {
      ...session,
      queue,
      position: session.position + 1,
      answeredCount: session.answeredCount + 1,
      correctCount: session.correctCount + (graded.correct ? 1 : 0),
      cleared,
      perfect,
      // La session se termine quand tous les verbes distincts sont réussis.
      finished: cleared.length >= session.totalUnique,
    },
    graded,
  };
}
