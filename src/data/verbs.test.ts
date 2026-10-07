import { describe, expect, it } from 'vitest';
import { allVerbs, verbsById } from '@/data/verbs';
import { ACTIVE_BASES, activeVerbs } from '@/data/curriculum';
import { gradeAnswer } from '@/lib/grading';

/**
 * Garde-fous sur les DONNÉES : la liste du manuel (pp. 160-161) et le lot
 * actuellement ouvert aux élèves.
 */
describe('liste complète du manuel', () => {
  it('contient les 119 verbes, numérotés 1 à 119 dans l’ordre', () => {
    expect(allVerbs).toHaveLength(119);
    expect(allVerbs.map((v) => v.order)).toEqual(allVerbs.map((_, i) => i + 1));
  });

  it('a des ids uniques et aucune case vide', () => {
    expect(new Set(allVerbs.map((v) => v.id)).size).toBe(allVerbs.length);
    for (const v of allVerbs) {
      expect(v.base, v.id).not.toBe('');
      expect(v.preterite, v.id).not.toBe('');
      expect(v.pastParticiple, v.id).not.toBe('');
      expect(v.translation, v.id).not.toBe('');
      expect(v.phonetics?.base, v.id).toMatch(/^\/.+\/$/);
      expect(v.phonetics?.preterite, v.id).toMatch(/^\/.+\/$/);
      expect(v.phonetics?.pastParticiple, v.id).toMatch(/^\/.+\/$/);
    }
  });

  it('respecte les repères notés en marge du manuel (5, 10, 15 … 65)', () => {
    const at = (n: number) => allVerbs[n - 1]!.base;
    expect(at(5)).toBe('begin');
    expect(at(10)).toBe('bleed');
    expect(at(15)).toBe('burn');
    expect(at(20)).toBe('cling');
    expect(at(25)).toBe('deal');
    expect(at(30)).toBe('drink');
    expect(at(35)).toBe('feel');
    expect(at(40)).toBe('forget');
    expect(at(45)).toBe('grow');
    expect(at(50)).toBe('hit');
    expect(at(55)).toBe('knit');
    expect(at(60)).toBe('leave');
    expect(at(65)).toBe('lose');
  });

  it('transcrit fidèlement quelques lignes de la photo', () => {
    const row = (base: string) => {
      const v = allVerbs.find((x) => x.base === base)!;
      return [v.base, v.preterite, v.pastParticiple, v.translation];
    };
    expect(row('be')).toEqual(['be', 'was / were', 'been', 'être']);
    expect(row('bear')).toEqual(['bear', 'bore', 'borne', 'porter, supporter']);
    expect(row('lie')).toEqual(['lie', 'lay', 'lain', "s'étendre, s'allonger"]);
    expect(row('swell')).toEqual(['swell', 'swelled', 'swollen', 'enfler']);
    expect(row('throw')).toEqual(['throw', 'threw', 'thrown', 'jeter']);
  });

  it('accepte les variantes correctes sans changer la réponse attendue', () => {
    const learn = verbsById['to-learn']!;
    expect(learn.preterite).toBe('learnt'); // forme du manuel
    const ok = gradeAnswer({ verb: learn, prompted: 'both' }, { preterite: 'learned', pastParticiple: 'learnt' });
    expect(ok.correct).toBe(true);
  });
});

describe('lot ouvert aux élèves', () => {
  it('est exactement : lot 1 (cast…come) + lot 2 (cost…dig), dans l’ordre du manuel', () => {
    expect(activeVerbs.map((v) => v.base)).toEqual([
      'cast', 'catch', 'choose', 'cling', 'come',
      'cost', 'creep', 'cut', 'deal', 'dig',
    ]);
  });

  it('transcrit fidèlement le lot 2 (photo : cost, creep, cut, deal, dig)', () => {
    const row = (base: string) => {
      const v = allVerbs.find((x) => x.base === base)!;
      return [v.base, v.preterite, v.pastParticiple, v.translation];
    };
    expect(row('cost')).toEqual(['cost', 'cost', 'cost', 'coûter']);
    expect(row('creep')).toEqual(['creep', 'crept', 'crept', 'ramper']);
    expect(row('cut')).toEqual(['cut', 'cut', 'cut', 'couper']);
    expect(row('deal')).toEqual(['deal', 'dealt', 'dealt', 'distribuer, négocier']);
    expect(row('dig')).toEqual(['dig', 'dug', 'dug', 'creuser']);
  });

  it('ne contient aucun verbe inconnu (config ↔ liste cohérentes)', () => {
    expect(activeVerbs).toHaveLength(ACTIVE_BASES.length);
  });

  it('a des réponses sans ambiguïté en mode expert (traductions distinctes)', () => {
    const translations = activeVerbs.map((v) => v.translation);
    expect(new Set(translations).size).toBe(translations.length);
  });
});
