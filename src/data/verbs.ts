import type { Verb } from '@/types';

/**
 * ============================================================================
 *  NIVEAU 1 — « Les indispensables »
 * ============================================================================
 *  Les 15 verbes irréguliers les plus fréquents de l'anglais, ceux qu'un
 *  collégien rencontre en permanence. Variété de référence : **britannique**.
 *
 *  Rappel des trois formes :
 *    base            = infinitif sans "to"        (be)
 *    preterite       = prétérit / past simple     (was / were)
 *    pastParticiple  = participe passé             (been)
 *
 *  Prononciations (IPA) données à titre indicatif en anglais britannique (RP).
 * ============================================================================
 */
export const level1Verbs: Verb[] = [
  {
    id: 'to-be',
    levelId: 'indispensables',
    base: 'be',
    preterite: 'was / were',
    pastParticiple: 'been',
    translation: 'être',
    accepted: { preterite: ['was', 'were'] },
    phonetics: { base: '/biː/', preterite: '/wɒz/, /wɜː/', pastParticiple: '/biːn/' },
    example: { en: 'I was at school yesterday.', fr: "J'étais à l'école hier." },
    frequencyRank: 1,
  },
  {
    id: 'to-have',
    levelId: 'indispensables',
    base: 'have',
    preterite: 'had',
    pastParticiple: 'had',
    translation: 'avoir',
    phonetics: { base: '/hæv/', preterite: '/hæd/', pastParticiple: '/hæd/' },
    example: { en: 'She had a good idea.', fr: 'Elle a eu une bonne idée.' },
    frequencyRank: 2,
  },
  {
    id: 'to-do',
    levelId: 'indispensables',
    base: 'do',
    preterite: 'did',
    pastParticiple: 'done',
    translation: 'faire',
    phonetics: { base: '/duː/', preterite: '/dɪd/', pastParticiple: '/dʌn/' },
    example: { en: 'We did our homework.', fr: 'Nous avons fait nos devoirs.' },
    frequencyRank: 3,
  },
  {
    id: 'to-go',
    levelId: 'indispensables',
    base: 'go',
    preterite: 'went',
    pastParticiple: 'gone',
    translation: 'aller',
    phonetics: { base: '/ɡəʊ/', preterite: '/went/', pastParticiple: '/ɡɒn/' },
    example: { en: 'They went to London.', fr: 'Ils sont allés à Londres.' },
    frequencyRank: 4,
  },
  {
    id: 'to-make',
    levelId: 'indispensables',
    base: 'make',
    preterite: 'made',
    pastParticiple: 'made',
    translation: 'fabriquer, faire',
    phonetics: { base: '/meɪk/', preterite: '/meɪd/', pastParticiple: '/meɪd/' },
    example: { en: 'He made a cake.', fr: 'Il a fait un gâteau.' },
    frequencyRank: 5,
  },
  {
    id: 'to-say',
    levelId: 'indispensables',
    base: 'say',
    preterite: 'said',
    pastParticiple: 'said',
    translation: 'dire',
    phonetics: { base: '/seɪ/', preterite: '/sed/', pastParticiple: '/sed/' },
    example: { en: 'She said hello.', fr: 'Elle a dit bonjour.' },
    frequencyRank: 6,
  },
  {
    id: 'to-get',
    levelId: 'indispensables',
    base: 'get',
    preterite: 'got',
    pastParticiple: 'got', // britannique (américain : gotten)
    translation: 'obtenir, recevoir',
    phonetics: { base: '/ɡet/', preterite: '/ɡɒt/', pastParticiple: '/ɡɒt/' },
    example: { en: 'I got a new phone.', fr: "J'ai eu un nouveau téléphone." },
    frequencyRank: 7,
  },
  {
    id: 'to-take',
    levelId: 'indispensables',
    base: 'take',
    preterite: 'took',
    pastParticiple: 'taken',
    translation: 'prendre',
    phonetics: { base: '/teɪk/', preterite: '/tʊk/', pastParticiple: '/ˈteɪkən/' },
    example: { en: 'He took the bus.', fr: 'Il a pris le bus.' },
    frequencyRank: 8,
  },
  {
    id: 'to-see',
    levelId: 'indispensables',
    base: 'see',
    preterite: 'saw',
    pastParticiple: 'seen',
    translation: 'voir',
    phonetics: { base: '/siː/', preterite: '/sɔː/', pastParticiple: '/siːn/' },
    example: { en: 'We saw a film.', fr: 'Nous avons vu un film.' },
    frequencyRank: 9,
  },
  {
    id: 'to-come',
    levelId: 'indispensables',
    base: 'come',
    preterite: 'came',
    pastParticiple: 'come',
    translation: 'venir',
    phonetics: { base: '/kʌm/', preterite: '/keɪm/', pastParticiple: '/kʌm/' },
    example: { en: 'She came home late.', fr: 'Elle est rentrée tard.' },
    frequencyRank: 10,
  },
  {
    id: 'to-know',
    levelId: 'indispensables',
    base: 'know',
    preterite: 'knew',
    pastParticiple: 'known',
    translation: 'savoir, connaître',
    phonetics: { base: '/nəʊ/', preterite: '/njuː/', pastParticiple: '/nəʊn/' },
    example: { en: 'I knew the answer.', fr: 'Je connaissais la réponse.' },
    frequencyRank: 11,
  },
  {
    id: 'to-give',
    levelId: 'indispensables',
    base: 'give',
    preterite: 'gave',
    pastParticiple: 'given',
    translation: 'donner',
    phonetics: { base: '/ɡɪv/', preterite: '/ɡeɪv/', pastParticiple: '/ˈɡɪvən/' },
    example: { en: 'He gave me a book.', fr: "Il m'a donné un livre." },
    frequencyRank: 12,
  },
  {
    id: 'to-find',
    levelId: 'indispensables',
    base: 'find',
    preterite: 'found',
    pastParticiple: 'found',
    translation: 'trouver',
    phonetics: { base: '/faɪnd/', preterite: '/faʊnd/', pastParticiple: '/faʊnd/' },
    example: { en: 'They found the keys.', fr: 'Ils ont trouvé les clés.' },
    frequencyRank: 13,
  },
  {
    id: 'to-think',
    levelId: 'indispensables',
    base: 'think',
    preterite: 'thought',
    pastParticiple: 'thought',
    translation: 'penser',
    phonetics: { base: '/θɪŋk/', preterite: '/θɔːt/', pastParticiple: '/θɔːt/' },
    example: { en: 'I thought about you.', fr: "J'ai pensé à toi." },
    frequencyRank: 14,
  },
  {
    id: 'to-tell',
    levelId: 'indispensables',
    base: 'tell',
    preterite: 'told',
    pastParticiple: 'told',
    translation: 'dire, raconter',
    phonetics: { base: '/tel/', preterite: '/təʊld/', pastParticiple: '/təʊld/' },
    example: { en: 'She told a story.', fr: 'Elle a raconté une histoire.' },
    frequencyRank: 15,
  },
];

/**
 * Liste complète des verbes de l'application.
 * Les niveaux suivants (invariables, changeants…) viendront s'ajouter ici.
 */
export const allVerbs: Verb[] = [...level1Verbs];

/** Accès rapide à un verbe par son id. */
export const verbsById: Record<string, Verb> = Object.fromEntries(
  allVerbs.map((verb) => [verb.id, verb]),
);
