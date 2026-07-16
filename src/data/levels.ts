import type { Level } from '@/types';

/**
 * Métadonnées des niveaux (parcours pédagogique).
 * Seul le Niveau 1 est renseigné en verbes pour l'instant ; les suivants
 * servent d'aperçu "à débloquer" sur l'écran d'accueil.
 */
export const levels: Level[] = [
  {
    id: 'indispensables',
    order: 1,
    title: 'Les indispensables',
    subtitle: 'Les 15 verbes que tu croises tout le temps.',
    emoji: '⭐',
    accent: '#6366f1',
  },
  {
    id: 'invariables',
    order: 2,
    title: 'Les invariables',
    subtitle: 'Une seule forme à retenir : cut / cut / cut.',
    emoji: '🧊',
    accent: '#0ea5e9',
  },
  {
    id: 'changeants',
    order: 3,
    title: 'Les changeants',
    subtitle: 'Ils changent de voyelle : sing / sang / sung.',
    emoji: '🌀',
    accent: '#f59e0b',
  },
  {
    id: 'jumeaux',
    order: 4,
    title: 'Les jumeaux',
    subtitle: 'Prétérit = participe passé : buy / bought / bought.',
    emoji: '👯',
    accent: '#22c55e',
  },
  {
    id: 'pieges',
    order: 5,
    title: 'Les pièges',
    subtitle: 'Les plus trompeurs : lie, lay, read…',
    emoji: '🎭',
    accent: '#ef4444',
  },
];

export const levelsById = Object.fromEntries(levels.map((l) => [l.id, l]));
