/**
 * Constantes de jeu réglables en un seul endroit (pour équilibrer facilement).
 */

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** Nombre de succès d'affilée pour marquer un verbe « Maîtrisé ». */
export const MASTERY_STREAK = 3;

/** Boîte Leitner maximale. */
export const MAX_BOX = 5;

/**
 * Intervalles de révision (répétition espacée) indexés par boîte Leitner.
 * box 0 = à revoir très vite … box 5 = maîtrisé sur la durée.
 */
export const REVIEW_INTERVALS_MS: readonly number[] = [
  1 * MINUTE,
  10 * MINUTE,
  1 * DAY,
  3 * DAY,
  7 * DAY,
  30 * DAY,
];

/** Points d'XP. */
export const XP_PER_CORRECT = 10;
export const XP_MASTERY_BONUS = 25;
export const XP_PERFECT_LEVEL_BONUS = 50;
export const XP_PER_BOSS_HIT = 5; // XP par coup porté au boss
export const XP_PER_LEVEL = 100; // pour dériver le « niveau élève »

/** Réglages du mode Boss Rush. */
export const BOSS_DURATION_SEC = 60;
export const BOSS_MAX_HP = 12; // coups pour vaincre le 1er boss

/** Un verbe raté est réinséré N positions plus loin dans la session. */
export const SESSION_REQUEUE_GAP = 3;

/** Seuils de déblocage des badges. */
export const BADGE_THRESHOLDS = {
  perseverantStreak: 3, // jours consécutifs
  flashBossScore: 10, // bonnes réponses en Boss Rush
  marathonienAnswers: 100, // réponses cumulées
} as const;
