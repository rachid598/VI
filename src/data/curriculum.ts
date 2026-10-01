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
 *  Lot actuel : les 5 verbes de la photo (cast · catch · choose · cling · come).
 * ============================================================================
 */
export const ACTIVE_BASES: readonly VerbBase[] = ['cast', 'catch', 'choose', 'cling', 'come'];

/** Verbes ouverts aux élèves, dans l'ordre du manuel. */
export const activeVerbs: Verb[] = allVerbs.filter((verb) =>
  (ACTIVE_BASES as readonly string[]).includes(verb.base),
);
