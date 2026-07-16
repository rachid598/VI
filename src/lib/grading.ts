import type { FormAnswer, FormKey, GradedAnswer, GradedForm, Question, Verb } from '@/types';

/**
 * Normalise une saisie pour la comparaison :
 * minuscules, sans espaces superflus, sans "to " initial ni apostrophes.
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^to\s+/, '')
    .replace(/['’"]/g, '')
    .replace(/\s+/g, ' ');
}

/** Réponse canonique d'une forme (ex. "was / were" pour le prétérit de be). */
export function canonicalForm(verb: Verb, form: FormKey): string {
  return form === 'preterite' ? verb.preterite : verb.pastParticiple;
}

/**
 * Ensemble des réponses acceptées pour une forme : variantes explicites
 * (`verb.accepted`) + formes séparées par « / » ou « , » dans la canonique.
 */
export function acceptedAnswers(verb: Verb, form: FormKey): string[] {
  const canonical = canonicalForm(verb, form);
  const explicit = verb.accepted?.[form] ?? [];
  const derived = canonical
    .split(/[/,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [...explicit, ...derived, canonical].map(normalize);
  return Array.from(new Set(all));
}

/** Une saisie est-elle correcte pour cette forme ? */
export function isFormCorrect(verb: Verb, form: FormKey, given: string): boolean {
  return acceptedAnswers(verb, form).includes(normalize(given));
}

function gradeForm(verb: Verb, form: FormKey, given: string): GradedForm {
  return {
    form,
    given,
    expected: canonicalForm(verb, form),
    correct: isFormCorrect(verb, form, given),
  };
}

/** Corrige une réponse en fonction de la/des forme(s) demandée(s). */
export function gradeAnswer(question: Question, answer: FormAnswer): GradedAnswer {
  const { verb, prompted } = question;
  const forms: GradedForm[] = [];

  if (prompted === 'preterite' || prompted === 'both') {
    forms.push(gradeForm(verb, 'preterite', answer.preterite ?? ''));
  }
  if (prompted === 'pastParticiple' || prompted === 'both') {
    forms.push(gradeForm(verb, 'pastParticiple', answer.pastParticiple ?? ''));
  }

  return {
    verbId: verb.id,
    correct: forms.length > 0 && forms.every((f) => f.correct),
    forms,
  };
}
