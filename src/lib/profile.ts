import type { BadgeId, LevelId, StreakState, UserProfile, Verb } from '@/types';
import { createProgress, isMastered, reviewVerb } from './srs';
import {
  BADGE_THRESHOLDS,
  DAY,
  XP_MASTERY_BONUS,
  XP_PER_BOSS_HIT,
  XP_PER_CORRECT,
  XP_PER_LEVEL,
  XP_PERFECT_LEVEL_BONUS,
} from './constants';

/**
 * Logique de mise à jour du profil élève. Fonctions PURES : elles reçoivent
 * l'état + le contexte (verbes, horloge) et renvoient un nouvel état.
 */

export const SCHEMA_VERSION = 1;

/** Profil neuf (premier lancement, aucun compte requis). */
export function createDefaultProfile(now: number = Date.now()): UserProfile {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    xp: 0,
    streak: { current: 0, longest: 0, lastActiveDate: null },
    progress: {},
    // Tous les niveaux sont accessibles d'emblée (l'enseignant choisit).
    unlockedLevels: ['indispensables', 'invariables', 'changeants', 'jumeaux', 'pieges'],
    badges: {
      infaillible: null,
      flash: null,
      perseverant: null,
      polyglotte: null,
      marathonien: null,
    },
    stats: { totalAnswers: 0, totalCorrect: 0, bestBossScore: 0 },
    settings: { sound: true, showPhonetics: true, reduceMotion: false, guessInfinitive: false },
  };
}

/** Niveau « élève » dérivé de l'XP (100 XP = 1 niveau). */
export function studentLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/* -------------------------------------------------------------------------- */
/*  Streak (flamme : jours consécutifs)                                       */
/* -------------------------------------------------------------------------- */

/** Clé de jour locale « YYYY-MM-DD ». */
export function toDayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayDiff(fromKey: string, toKey: string): number {
  const a = new Date(`${fromKey}T00:00:00`).getTime();
  const b = new Date(`${toKey}T00:00:00`).getTime();
  return Math.round((b - a) / DAY);
}

/** Enregistre une activité du jour et met à jour la flamme. */
export function registerActivity(streak: StreakState, now: number): StreakState {
  const today = toDayKey(now);
  if (streak.lastActiveDate === today) return streak; // déjà actif aujourd'hui

  let current = 1;
  if (streak.lastActiveDate) {
    current = dayDiff(streak.lastActiveDate, today) === 1 ? streak.current + 1 : 1;
  }
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDate: today,
  };
}

/** Si la dernière activité date de ≥ 2 jours, la flamme retombe à 0. */
export function decayStreak(streak: StreakState, now: number): StreakState {
  if (!streak.lastActiveDate) return streak;
  if (dayDiff(streak.lastActiveDate, toDayKey(now)) >= 2 && streak.current !== 0) {
    return { ...streak, current: 0 };
  }
  return streak;
}

/* -------------------------------------------------------------------------- */
/*  Badges                                                                    */
/* -------------------------------------------------------------------------- */

/** Réévalue les badges automatiques (les autres sont débloqués par événement). */
export function evaluateBadges(
  profile: UserProfile,
  verbs: Verb[],
  now: number,
): UserProfile['badges'] {
  const badges = { ...profile.badges };
  const unlock = (id: BadgeId) => {
    if (badges[id] == null) badges[id] = now;
  };

  if (profile.streak.current >= BADGE_THRESHOLDS.perseverantStreak) unlock('perseverant');
  if (profile.stats.bestBossScore >= BADGE_THRESHOLDS.flashBossScore) unlock('flash');
  if (profile.stats.totalAnswers >= BADGE_THRESHOLDS.marathonienAnswers) unlock('marathonien');

  const levelIds = Array.from(new Set(verbs.map((v) => v.levelId)));
  const anyLevelMastered = levelIds.some((lid) => {
    const inLevel = verbs.filter((v) => v.levelId === lid);
    return inLevel.length > 0 && inLevel.every((v) => isMastered(profile.progress[v.id]));
  });
  if (anyLevelMastered) unlock('polyglotte');

  return badges;
}

/* -------------------------------------------------------------------------- */
/*  Mutations principales                                                     */
/* -------------------------------------------------------------------------- */

/** Applique une réponse (bonne/mauvaise) à un verbe : SRS + XP + streak + badges. */
export function applyAnswer(
  profile: UserProfile,
  verb: Verb,
  correct: boolean,
  verbs: Verb[],
  now: number,
): UserProfile {
  const prev = profile.progress[verb.id] ?? createProgress(verb.id);
  const wasMastered = prev.status === 'mastered';
  const next = reviewVerb(prev, correct, now);
  const becameMastered = !wasMastered && next.status === 'mastered';

  let xp = profile.xp + (correct ? XP_PER_CORRECT : 0);
  if (becameMastered) xp += XP_MASTERY_BONUS;

  const updated: UserProfile = {
    ...profile,
    xp,
    streak: registerActivity(profile.streak, now),
    progress: { ...profile.progress, [verb.id]: next },
    stats: {
      ...profile.stats,
      totalAnswers: profile.stats.totalAnswers + 1,
      totalCorrect: profile.stats.totalCorrect + (correct ? 1 : 0),
    },
  };

  return { ...updated, badges: evaluateBadges(updated, verbs, now) };
}

/** Fin d'un niveau : bonus si sans faute, déblocage du niveau suivant. */
export function completeLevel(
  profile: UserProfile,
  perfect: boolean,
  verbs: Verb[],
  now: number,
  nextLevelId?: LevelId,
): UserProfile {
  const badges = { ...profile.badges };
  let xp = profile.xp;
  if (perfect) {
    xp += XP_PERFECT_LEVEL_BONUS;
    if (badges.infaillible == null) badges.infaillible = now;
  }

  const unlockedLevels =
    nextLevelId && !profile.unlockedLevels.includes(nextLevelId)
      ? [...profile.unlockedLevels, nextLevelId]
      : profile.unlockedLevels;

  const updated: UserProfile = { ...profile, xp, badges, unlockedLevels };
  return { ...updated, badges: evaluateBadges(updated, verbs, now) };
}

/**
 * Enregistre un score de Boss Rush : garde le meilleur, crédite de l'XP
 * (mode arcade, distinct de la répétition espacée) et compte l'activité du jour.
 */
export function recordBossScore(
  profile: UserProfile,
  score: number,
  verbs: Verb[],
  now: number,
): UserProfile {
  const updated: UserProfile = {
    ...profile,
    xp: profile.xp + score * XP_PER_BOSS_HIT,
    streak: registerActivity(profile.streak, now),
    stats: { ...profile.stats, bestBossScore: Math.max(profile.stats.bestBossScore, score) },
  };
  return { ...updated, badges: evaluateBadges(updated, verbs, now) };
}

/* -------------------------------------------------------------------------- */
/*  Sélecteurs (lecture)                                                      */
/* -------------------------------------------------------------------------- */

/** Nombre de verbes maîtrisés dans un niveau donné. */
export function masteredCountForLevel(
  profile: UserProfile,
  verbs: Verb[],
  levelId: LevelId,
): number {
  return verbs.filter((v) => v.levelId === levelId && isMastered(profile.progress[v.id])).length;
}
