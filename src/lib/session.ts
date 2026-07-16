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
}

/**
 * Sélectionne les verbes d'une session : ceux « dus » d'abord (répétition
 * espacée), puis les autres, chacun trié par fréquence d'usage.
 */
export function selectVerbs(
  verbs: Verb[],
  progress: Record<string, VerbProgress>,
  now: number,
  size: number,
): Verb[] {
  const byFreq = (a: Verb, b: Verb) => (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999);
  const due = verbs.filter((v) => isDue(progress[v.id], now)).sort(byFreq);
  const rest = verbs.filter((v) => !isDue(progress[v.id], now)).sort(byFreq);
  return [...due, ...rest].slice(0, size);
}

/** Crée une session à partir d'un lot de verbes. */
export function createSession(
  source: LevelId | 'revision',
  verbs: Verb[],
  options: CreateSessionOptions = {},
): TrainingSession {
  const { now = Date.now(), size = verbs.length, prompted = 'both', progress = {} } = options;
  const chosen = selectVerbs(verbs, progress, now, size);
  const queue: Question[] = chosen.map((verb) => ({ verb, prompted }));
  return {
    source,
    queue,
    position: 0,
    answeredCount: 0,
    correctCount: 0,
    perfect: true,
    finished: queue.length === 0,
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

  if (!graded.correct) {
    perfect = false;
    const insertAt = Math.min(session.position + 1 + SESSION_REQUEUE_GAP, queue.length);
    queue.splice(insertAt, 0, question);
  }

  const position = session.position + 1;
  return {
    session: {
      ...session,
      queue,
      position,
      answeredCount: session.answeredCount + 1,
      correctCount: session.correctCount + (graded.correct ? 1 : 0),
      perfect,
      finished: position >= queue.length,
    },
    graded,
  };
}
