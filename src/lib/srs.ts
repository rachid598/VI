import type { MasteryStatus, VerbProgress } from '@/types';
import { MASTERY_STREAK, MAX_BOX, REVIEW_INTERVALS_MS } from './constants';

/**
 * Moteur de répétition espacée (système de boîtes de Leitner).
 * Toutes les fonctions sont PURES : aucune lecture de date/état global.
 */

/** Progression neuve pour un verbe jamais rencontré. */
export function createProgress(verbId: string): VerbProgress {
  return {
    verbId,
    status: 'new',
    correctStreak: 0,
    box: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    lastSeen: 0,
    nextReview: 0,
  };
}

function statusFor(correctStreak: number, totalAttempts: number): MasteryStatus {
  if (correctStreak >= MASTERY_STREAK) return 'mastered';
  if (totalAttempts > 0) return 'learning';
  return 'new';
}

/**
 * Met à jour la progression d'un verbe après une réponse.
 * - Bonne réponse : la boîte monte, le prochain rappel est plus lointain.
 * - Mauvaise réponse : la boîte retombe à 0 → le verbe réapparaît vite.
 */
export function reviewVerb(progress: VerbProgress, correct: boolean, now: number): VerbProgress {
  const correctStreak = correct ? progress.correctStreak + 1 : 0;
  const box = correct ? Math.min(progress.box + 1, MAX_BOX) : 0;
  const totalAttempts = progress.totalAttempts + 1;
  const totalCorrect = progress.totalCorrect + (correct ? 1 : 0);
  const interval = REVIEW_INTERVALS_MS[box] ?? REVIEW_INTERVALS_MS[MAX_BOX]!;

  return {
    ...progress,
    correctStreak,
    box,
    totalAttempts,
    totalCorrect,
    lastSeen: now,
    nextReview: now + interval,
    status: statusFor(correctStreak, totalAttempts),
  };
}

/** Un verbe est « dû » s'il n'a jamais été vu ou si son rappel est arrivé. */
export function isDue(progress: VerbProgress | undefined, now: number): boolean {
  if (!progress) return true;
  return progress.nextReview <= now;
}

/** Le verbe est-il maîtrisé (3 succès d'affilée) ? */
export function isMastered(progress: VerbProgress | undefined): boolean {
  return progress?.status === 'mastered';
}
