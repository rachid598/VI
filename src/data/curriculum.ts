import type { Verb } from '@/types';
import { allVerbs, type VerbBase } from '@/data/verbs';

/**
 * ============================================================================
 *  PROGRAMME DE LA CLASSE — verbes ouverts aux élèves
 * ============================================================================
 *  Les élèves s'entraînent UNIQUEMENT sur les verbes listés ci-dessous
 *  (entraînement, révision mélangée, Boss Rush, badges).
 *
 *  La liste complète du manuel (119 verbes) est déjà dans `data/verbs.ts`.
 *  Pour ouvrir de nouveaux verbes : ajoute leur infinitif ici, puis déploie.
 *  Une faute de frappe est détectée à la compilation (le build échoue et le
 *  site en ligne reste inchangé).
 *
 *  Les lots s'ajoutent les uns aux autres : les élèves continuent de réviser
 *  les anciens verbes (la répétition espacée les fait revenir quand il faut).
 *  Pour ne garder que le dernier lot, supprime les lignes des lots précédents.
 * ============================================================================
 */
export const ACTIVE_BASES: readonly VerbBase[] = [
  // Lot 1
  'cast', 'catch', 'choose', 'cling', 'come',
  // Lot 2
  'cost', 'creep', 'cut', 'deal', 'dig',
];

/** Verbes ouverts aux élèves, dans l'ordre du manuel. */
export const activeVerbs: Verb[] = allVerbs.filter((verb) =>
  (ACTIVE_BASES as readonly string[]).includes(verb.base),
);
