/**
 * ============================================================================
 *  Types du domaine — Verbes Irréguliers (PWA collège)
 * ============================================================================
 *  Ce fichier est la "source de vérité" du typage. Deux blocs :
 *   1. Le CONTENU pédagogique   -> Verb, Level (immuable, vient de /data)
 *   2. La PROGRESSION de l'élève -> UserProfile (mutable, stockée en LocalStorage)
 * ============================================================================
 */

/* ==========================================================================
 * 1. CONTENU PÉDAGOGIQUE
 * ========================================================================== */

/** Identifiant d'un niveau (regroupement thématique / morphologique). */
export type LevelId =
  | 'indispensables' // N1 — les plus fréquents (be, have, go…)
  | 'invariables'    // N2 — base = prétérit = participe passé (cut/cut/cut)
  | 'changeants'     // N3 — forte variation vocalique (sing/sang/sung)
  | 'jumeaux'        // N4 — prétérit = participe passé (buy/bought/bought)
  | 'pieges';        // N5 — les plus trompeurs (lie, lay, read…)

/**
 * Prononciation textuelle (API phonétique / IPA) d'un verbe.
 * Toutes les clés sont optionnelles : on complète au fur et à mesure.
 * Variété de référence : **anglais britannique (RP)**.
 */
export interface VerbPhonetics {
  base?: string;           // ex. /biː/
  preterite?: string;      // ex. /wɒz/
  pastParticiple?: string; // ex. /biːn/
}

/** Phrase d'exemple bilingue pour contextualiser le verbe. */
export interface VerbExample {
  en: string;
  fr: string;
}

/**
 * Un verbe irrégulier et ses trois formes.
 * `base` = infinitif sans "to" (be), `preterite` = past simple (was/were),
 * `pastParticiple` = participe passé (been).
 */
export interface Verb {
  /** Slug stable et unique (ne change jamais) — ex. "to-be". */
  id: string;
  /** Niveau de rattachement. */
  levelId: LevelId;

  base: string;
  preterite: string;
  pastParticiple: string;

  /** Traduction française de l'infinitif — ex. "être". */
  translation: string;

  /**
   * Formes alternatives ACCEPTÉES à la correction (orthographes/variantes),
   * en plus de la forme canonique ci-dessus. Ex. preterite: ["was", "were"].
   * Sert au moteur de correction, pas à l'affichage.
   */
  accepted?: {
    preterite?: string[];
    pastParticiple?: string[];
  };

  phonetics?: VerbPhonetics;
  example?: VerbExample;

  /** true si base = prétérit = participe passé (cut/cut/cut). */
  isInvariant?: boolean;
  /** Rang de fréquence d'usage (1 = très fréquent) — utile pour le tri. */
  frequencyRank?: number;
}

/** Métadonnées d'un niveau (pour l'écran d'accueil / la carte du monde). */
export interface Level {
  id: LevelId;
  /** Ordre d'affichage / de déblocage (1, 2, 3…). */
  order: number;
  title: string;      // "Les indispensables"
  subtitle: string;   // court pitch pour l'élève
  emoji: string;      // touche ludique dans l'UI
  /** Couleur d'accent (token Tailwind ou hex) pour la carte du niveau. */
  accent: string;
}

/* ==========================================================================
 * 2. PROGRESSION DE L'ÉLÈVE (LocalStorage)
 * ========================================================================== */

/** État de maîtrise d'un verbe pour l'élève. */
export type MasteryStatus =
  | 'new'      // jamais tenté
  | 'learning' // en cours d'apprentissage
  | 'mastered'; // 3 succès d'affilée -> maîtrisé

/**
 * Suivi d'un verbe pour la répétition espacée (système de "boîtes" Leitner).
 * `box` monte à chaque succès, retombe à 0 à chaque échec ;
 * `nextReview` détermine quand le verbe doit réapparaître.
 */
export interface VerbProgress {
  verbId: string;
  status: MasteryStatus;
  /** Succès consécutifs (atteint 3 -> statut "mastered"). */
  correctStreak: number;
  /** Boîte Leitner courante (0 = à revoir vite … 5 = maîtrisé longtemps). */
  box: number;
  totalCorrect: number;
  totalAttempts: number;
  /** Horodatage (ms) de la dernière rencontre. */
  lastSeen: number;
  /** Horodatage (ms) de la prochaine révision due. */
  nextReview: number;
}

/** Identifiants des badges déblocables. */
export type BadgeId =
  | 'infaillible'  // un niveau réussi sans aucune faute
  | 'flash'        // score élevé en mode Boss Rush
  | 'perseverant'  // streak de plusieurs jours consécutifs
  | 'polyglotte'   // premier niveau 100% maîtrisé
  | 'marathonien'; // grand nombre de réponses cumulées

/** Définition (statique) d'un badge — pour l'affichage de la collection. */
export interface BadgeDefinition {
  id: BadgeId;
  label: string;       // "Infaillible"
  description: string; // condition d'obtention, côté élève
  emoji: string;
}

/** Suivi du "streak" (jours consécutifs d'activité). */
export interface StreakState {
  current: number;
  longest: number;
  /** Date locale de la dernière activité, au format "YYYY-MM-DD". */
  lastActiveDate: string | null;
}

/** Réglages simples (aucun compte requis). */
export interface UserSettings {
  sound: boolean;         // synthèse vocale / effets sonores
  showPhonetics: boolean; // afficher la prononciation
  reduceMotion: boolean;  // accessibilité : réduire les animations
}

/**
 * Profil complet de l'élève, sérialisé tel quel dans le LocalStorage.
 * `schemaVersion` permet de migrer proprement les données existantes
 * si la structure évolue dans une version future de l'app.
 */
export interface UserProfile {
  schemaVersion: number;
  createdAt: number;

  /** Points d'expérience cumulés. */
  xp: number;

  streak: StreakState;

  /** Progression par verbe — clé = Verb["id"]. */
  progress: Record<string, VerbProgress>;

  /** Niveaux débloqués par l'élève. */
  unlockedLevels: LevelId[];

  /** Badge -> horodatage de déblocage (null = non débloqué). */
  badges: Record<BadgeId, number | null>;

  stats: {
    totalAnswers: number;
    totalCorrect: number;
    /** Meilleur score obtenu en mode Boss Rush. */
    bestBossScore: number;
  };

  settings: UserSettings;
}

/* ==========================================================================
 * 3. TYPES DE SESSION DE JEU (transitoires, non persistés)
 * ========================================================================== */

/** Quelle forme du verbe l'élève doit-il produire dans la question ? */
export type PromptedForm = 'preterite' | 'pastParticiple' | 'both';

/** Une question posée pendant un entraînement ou un Boss Rush. */
export interface Question {
  verb: Verb;
  prompted: PromptedForm;
}

/** Résultat de la correction d'une réponse. */
export interface AnswerResult {
  correct: boolean;
  /** Réponse saisie par l'élève (normalisée). */
  given: string;
  /** Réponse(s) attendue(s) pour l'affichage de la correction. */
  expected: string;
}
