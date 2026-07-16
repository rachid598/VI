import type { BadgeDefinition } from '@/types';

/** Catalogue des badges déblocables (métadonnées d'affichage). */
export const badges: BadgeDefinition[] = [
  {
    id: 'infaillible',
    label: 'Infaillible',
    description: 'Termine un niveau sans aucune faute.',
    emoji: '🎯',
  },
  {
    id: 'flash',
    label: 'Flash',
    description: 'Enchaîne 10 bonnes réponses en Boss Rush.',
    emoji: '⚡',
  },
  {
    id: 'perseverant',
    label: 'Persévérant',
    description: 'Reviens t’entraîner 3 jours de suite.',
    emoji: '🔥',
  },
  {
    id: 'polyglotte',
    label: 'Polyglotte',
    description: 'Maîtrise 100 % d’un niveau.',
    emoji: '🧠',
  },
  {
    id: 'marathonien',
    label: 'Marathonien',
    description: 'Réponds à 100 questions au total.',
    emoji: '🏃',
  },
];

export const badgesById = Object.fromEntries(badges.map((b) => [b.id, b]));
