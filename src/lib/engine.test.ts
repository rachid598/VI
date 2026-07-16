import { describe, expect, it } from 'vitest';
import { verbsById, level1Verbs, allVerbs } from '@/data/verbs';
import { gradeAnswer, normalize } from '@/lib/grading';
import { createProgress, isDue, reviewVerb } from '@/lib/srs';
import {
  applyAnswer,
  createDefaultProfile,
  decayStreak,
  evaluateBadges,
  registerActivity,
} from '@/lib/profile';
import { createSession, selectVerbs, submitAnswer } from '@/lib/session';
import { clearProfile, loadProfile, saveProfile, type StorageBackend } from '@/lib/storage';
import { DAY, REVIEW_INTERVALS_MS } from '@/lib/constants';
import type { UserProfile } from '@/types';

const be = verbsById['to-be']!;
const go = verbsById['to-go']!;
const T0 = new Date(2026, 0, 15, 12, 0, 0).getTime(); // 15 janv. 2026, midi local

/* -------------------------------------------------------------------------- */
describe('grading', () => {
  it('accepte les deux formes correctes (both)', () => {
    const r = gradeAnswer({ verb: go, prompted: 'both' }, { preterite: 'went', pastParticiple: 'gone' });
    expect(r.correct).toBe(true);
    expect(r.forms).toHaveLength(2);
  });

  it('échoue si une forme est fausse', () => {
    const r = gradeAnswer({ verb: go, prompted: 'both' }, { preterite: 'goed', pastParticiple: 'gone' });
    expect(r.correct).toBe(false);
    expect(r.forms.find((f) => f.form === 'preterite')?.correct).toBe(false);
  });

  it('accepte les variantes was / were pour be', () => {
    expect(gradeAnswer({ verb: be, prompted: 'preterite' }, { preterite: 'was' }).correct).toBe(true);
    expect(gradeAnswer({ verb: be, prompted: 'preterite' }, { preterite: 'were' }).correct).toBe(true);
  });

  it('normalise casse, espaces et "to"', () => {
    expect(normalize('  To GO ')).toBe('go');
    expect(gradeAnswer({ verb: go, prompted: 'pastParticiple' }, { pastParticiple: ' GONE ' }).correct).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
describe('srs (Leitner)', () => {
  it('monte la boîte et programme le prochain rappel', () => {
    const p = reviewVerb(createProgress('x'), true, T0);
    expect(p.box).toBe(1);
    expect(p.correctStreak).toBe(1);
    expect(p.status).toBe('learning');
    expect(p.nextReview).toBe(T0 + REVIEW_INTERVALS_MS[1]!);
  });

  it('marque « maîtrisé » après 3 succès d’affilée', () => {
    let p = createProgress('x');
    p = reviewVerb(p, true, T0);
    p = reviewVerb(p, true, T0);
    p = reviewVerb(p, true, T0);
    expect(p.status).toBe('mastered');
    expect(p.correctStreak).toBe(3);
    expect(p.box).toBe(3);
  });

  it('retombe en boîte 0 après une faute (réapparition rapide)', () => {
    let p = createProgress('x');
    p = reviewVerb(p, true, T0);
    p = reviewVerb(p, false, T0);
    expect(p.box).toBe(0);
    expect(p.correctStreak).toBe(0);
    expect(p.status).toBe('learning');
    expect(p.nextReview).toBe(T0 + REVIEW_INTERVALS_MS[0]!);
  });

  it('considère un verbe jamais vu comme dû', () => {
    expect(isDue(undefined, T0)).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
describe('profile — réponses & XP', () => {
  it('crédite XP, stats et streak sur une bonne réponse', () => {
    const p = applyAnswer(createDefaultProfile(T0), go, true, allVerbs, T0);
    expect(p.xp).toBe(10);
    expect(p.stats.totalAnswers).toBe(1);
    expect(p.stats.totalCorrect).toBe(1);
    expect(p.streak.current).toBe(1);
    expect(p.progress[go.id]?.correctStreak).toBe(1);
  });

  it('ajoute le bonus de maîtrise (3 succès)', () => {
    let p = createDefaultProfile(T0);
    p = applyAnswer(p, go, true, allVerbs, T0);
    p = applyAnswer(p, go, true, allVerbs, T0);
    p = applyAnswer(p, go, true, allVerbs, T0);
    expect(p.progress[go.id]?.status).toBe('mastered');
    expect(p.xp).toBe(10 + 10 + 10 + 25); // 3 bonnes réponses + bonus
  });
});

/* -------------------------------------------------------------------------- */
describe('profile — streak (flamme)', () => {
  it('incrémente sur jours consécutifs, ignore le même jour', () => {
    let s = registerActivity(createDefaultProfile(T0).streak, T0);
    expect(s.current).toBe(1);
    s = registerActivity(s, T0 + 3 * 3600_000); // même jour
    expect(s.current).toBe(1);
    s = registerActivity(s, T0 + DAY); // lendemain
    expect(s.current).toBe(2);
    expect(s.longest).toBe(2);
  });

  it('repart à 1 après un jour manqué', () => {
    let s = registerActivity(createDefaultProfile(T0).streak, T0);
    s = registerActivity(s, T0 + 3 * DAY);
    expect(s.current).toBe(1);
  });

  it('fait retomber la flamme à 0 après ≥ 2 jours d’absence', () => {
    const s = registerActivity(createDefaultProfile(T0).streak, T0);
    expect(decayStreak(s, T0 + DAY).current).toBe(1); // hier -> ok
    expect(decayStreak(s, T0 + 2 * DAY).current).toBe(0); // trop tard
  });
});

/* -------------------------------------------------------------------------- */
describe('profile — badges', () => {
  it('débloque « marathonien » à 100 réponses', () => {
    const base = createDefaultProfile(T0);
    const profile: UserProfile = { ...base, stats: { ...base.stats, totalAnswers: 100 } };
    expect(evaluateBadges(profile, allVerbs, T0).marathonien).not.toBeNull();
  });

  it('débloque « polyglotte » quand un niveau est 100 % maîtrisé', () => {
    let p = createDefaultProfile(T0);
    for (const v of level1Verbs) {
      p = applyAnswer(p, v, true, allVerbs, T0);
      p = applyAnswer(p, v, true, allVerbs, T0);
      p = applyAnswer(p, v, true, allVerbs, T0);
    }
    expect(p.badges.polyglotte).not.toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
describe('session', () => {
  it('sélectionne les verbes dus en priorité, triés par fréquence', () => {
    const sel = selectVerbs(level1Verbs, {}, T0, 3);
    expect(sel.map((v) => v.id)).toEqual(['to-be', 'to-have', 'to-do']);
  });

  it('réinsère un verbe raté et casse le « sans-faute »', () => {
    const session = createSession('indispensables', level1Verbs, { size: 3, now: T0 });
    const { session: s1, graded } = submitAnswer(session, { preterite: 'x', pastParticiple: 'y' });
    expect(graded.correct).toBe(false);
    expect(s1.perfect).toBe(false);
    expect(s1.queue.length).toBe(4); // 3 + le verbe raté réinséré
  });

  it('termine la session quand la file est épuisée', () => {
    let session = createSession('indispensables', [be], { size: 1, now: T0 });
    const r = submitAnswer(session, { preterite: 'was', pastParticiple: 'been' });
    session = r.session;
    expect(r.graded.correct).toBe(true);
    expect(session.finished).toBe(true);
    expect(session.perfect).toBe(true);
  });

  it('se termine dès que tous les verbes sont réussis (même après des fautes)', () => {
    let session = createSession('indispensables', [be, go], { size: 2, now: T0 });
    expect(session.totalUnique).toBe(2);

    // Faute sur « be » : réinséré, session pas finie, progression inchangée.
    session = submitAnswer(session, { preterite: 'x', pastParticiple: 'y' }).session;
    expect(session.finished).toBe(false);
    expect(session.cleared).toHaveLength(0);

    // « go » réussi, puis « be » réussi -> tous les verbes distincts sont clairs.
    session = submitAnswer(session, { preterite: 'went', pastParticiple: 'gone' }).session;
    session = submitAnswer(session, { preterite: 'was', pastParticiple: 'been' }).session;

    expect(session.cleared.sort()).toEqual(['to-be', 'to-go']);
    expect(session.finished).toBe(true);
    expect(session.perfect).toBe(false);
    expect(session.answeredCount).toBe(3);
  });
});

/* -------------------------------------------------------------------------- */
describe('storage', () => {
  function memoryBackend(): StorageBackend {
    const m = new Map<string, string>();
    return {
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => void m.set(k, v),
      removeItem: (k) => void m.delete(k),
    };
  }

  it('sauvegarde et recharge le profil à l’identique', () => {
    const backend = memoryBackend();
    const profile = applyAnswer(createDefaultProfile(T0), go, true, allVerbs, T0);
    saveProfile(profile, backend);
    expect(loadProfile(backend)).toEqual(profile);
  });

  it('renvoie un profil par défaut si vide ou corrompu', () => {
    const backend = memoryBackend();
    expect(loadProfile(backend).xp).toBe(0);
    backend.setItem('vi.profile', '{ pas du json');
    expect(loadProfile(backend).xp).toBe(0);
  });

  it('migre un profil d’un ancien schéma en conservant les données', () => {
    const backend = memoryBackend();
    const old = { ...createDefaultProfile(T0), schemaVersion: 0, xp: 42 };
    backend.setItem('vi.profile', JSON.stringify(old));
    const loaded = loadProfile(backend);
    expect(loaded.schemaVersion).toBe(1);
    expect(loaded.xp).toBe(42);
  });

  it('efface le profil', () => {
    const backend = memoryBackend();
    saveProfile(createDefaultProfile(T0), backend);
    clearProfile(backend);
    expect(backend.getItem('vi.profile')).toBeNull();
  });
});
