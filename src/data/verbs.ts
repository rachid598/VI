import type { Verb } from '@/types';

/**
 * ============================================================================
 *  Liste des verbes irréguliers — « Précis grammatical n°27 » (pp. 160-161)
 * ============================================================================
 *  Transcrite dans l'ORDRE DU MANUEL (le numéro `order` = position dans la
 *  liste, comme les numéros 5, 10, 15… notés en marge).
 *
 *  Colonnes : infinitif · prétérit · participe passé · traduction · phonétique
 *  Phonétique (IPA, anglais britannique) : « infinitif | prétérit | participe »,
 *  sans les barres obliques ; plusieurs prononciations séparées par une virgule.
 *
 *  ⚠️  Ce fichier contient TOUTE la liste, mais les élèves ne travaillent que
 *      sur les verbes listés dans `src/data/curriculum.ts` (ACTIVE_BASES).
 * ============================================================================
 */

type Row = readonly [
  base: string,
  preterite: string,
  pastParticiple: string,
  translation: string,
  ipa: string,
];

const ROWS = [
  // ---- Page 160, colonne de gauche ----
  ['awake', 'awoke', 'awoken', "s'éveiller", 'əˈweɪk|əˈwəʊk|əˈwəʊkən'],
  ['be', 'was / were', 'been', 'être', 'biː|wɒz, wɜː|biːn'],
  ['bear', 'bore', 'borne', 'porter, supporter', 'beə|bɔː|bɔːn'],
  ['become', 'became', 'become', 'devenir', 'bɪˈkʌm|bɪˈkeɪm|bɪˈkʌm'],
  ['begin', 'began', 'begun', 'commencer', 'bɪˈɡɪn|bɪˈɡæn|bɪˈɡʌn'],
  ['bend', 'bent', 'bent', 'se pencher', 'bend|bent|bent'],
  ['bet', 'bet', 'bet', 'parier', 'bet|bet|bet'],
  ['bind', 'bound', 'bound', 'lier', 'baɪnd|baʊnd|baʊnd'],
  ['bite', 'bit', 'bitten', 'mordre', 'baɪt|bɪt|ˈbɪtən'],
  ['bleed', 'bled', 'bled', 'saigner', 'bliːd|bled|bled'],
  ['blow', 'blew', 'blown', 'souffler', 'bləʊ|bluː|bləʊn'],
  ['break', 'broke', 'broken', 'casser', 'breɪk|brəʊk|ˈbrəʊkən'],
  ['bring', 'brought', 'brought', 'apporter', 'brɪŋ|brɔːt|brɔːt'],
  ['build', 'built', 'built', 'construire', 'bɪld|bɪlt|bɪlt'],
  ['burn', 'burnt', 'burnt', 'brûler', 'bɜːn|bɜːnt|bɜːnt'],
  ['buy', 'bought', 'bought', 'acheter', 'baɪ|bɔːt|bɔːt'],
  ['cast', 'cast', 'cast', 'lancer, jeter', 'kɑːst|kɑːst|kɑːst'],
  ['catch', 'caught', 'caught', 'attraper', 'kætʃ|kɔːt|kɔːt'],
  ['choose', 'chose', 'chosen', 'choisir', 'tʃuːz|tʃəʊz|ˈtʃəʊzən'],
  ['cling', 'clung', 'clung', "s'agripper, s'accrocher", 'klɪŋ|klʌŋ|klʌŋ'],
  ['come', 'came', 'come', 'venir', 'kʌm|keɪm|kʌm'],
  ['cost', 'cost', 'cost', 'coûter', 'kɒst|kɒst|kɒst'],
  ['creep', 'crept', 'crept', 'ramper', 'kriːp|krept|krept'],
  ['cut', 'cut', 'cut', 'couper', 'kʌt|kʌt|kʌt'],
  ['deal', 'dealt', 'dealt', 'distribuer, négocier', 'diːl|delt|delt'],
  ['dig', 'dug', 'dug', 'creuser', 'dɪɡ|dʌɡ|dʌɡ'],
  ['do', 'did', 'done', 'faire', 'duː|dɪd|dʌn'],
  ['draw', 'drew', 'drawn', 'dessiner', 'drɔː|druː|drɔːn'],
  ['dream', 'dreamt', 'dreamt', 'rêver', 'driːm|dremt|dremt'],
  ['drink', 'drank', 'drunk', 'boire', 'drɪŋk|dræŋk|drʌŋk'],
  ['drive', 'drove', 'driven', 'conduire', 'draɪv|drəʊv|ˈdrɪvən'],
  ['eat', 'ate', 'eaten', 'manger', 'iːt|et|ˈiːtən'],
  ['fall', 'fell', 'fallen', 'tomber', 'fɔːl|fel|ˈfɔːlən'],
  ['feed', 'fed', 'fed', 'nourrir', 'fiːd|fed|fed'],
  ['feel', 'felt', 'felt', 'sentir, ressentir', 'fiːl|felt|felt'],
  ['fight', 'fought', 'fought', 'se battre, combattre', 'faɪt|fɔːt|fɔːt'],
  ['find', 'found', 'found', 'trouver', 'faɪnd|faʊnd|faʊnd'],

  // ---- Page 160, colonne de droite ----
  ['fly', 'flew', 'flown', 'voler', 'flaɪ|fluː|fləʊn'],
  ['forbid', 'forbade', 'forbidden', 'interdire', 'fəˈbɪd|fəˈbæd|fəˈbɪdən'],
  ['forget', 'forgot', 'forgotten', 'oublier', 'fəˈɡet|fəˈɡɒt|fəˈɡɒtən'],
  ['freeze', 'froze', 'frozen', 'geler, congeler', 'friːz|frəʊz|ˈfrəʊzən'],
  ['get', 'got', 'got', 'obtenir', 'ɡet|ɡɒt|ɡɒt'],
  ['give', 'gave', 'given', 'donner', 'ɡɪv|ɡeɪv|ˈɡɪvən'],
  ['go', 'went', 'gone', 'aller', 'ɡəʊ|went|ɡɒn'],
  ['grow', 'grew', 'grown', 'grandir, faire pousser', 'ɡrəʊ|ɡruː|ɡrəʊn'],
  ['hang', 'hung', 'hung', 'pendre', 'hæŋ|hʌŋ|hʌŋ'],
  ['have', 'had', 'had', 'avoir', 'hæv|hæd|hæd'],
  ['hear', 'heard', 'heard', 'entendre', 'hɪə|hɜːd|hɜːd'],
  ['hide', 'hid', 'hidden', '(se) cacher', 'haɪd|hɪd|ˈhɪdən'],
  ['hit', 'hit', 'hit', 'frapper', 'hɪt|hɪt|hɪt'],
  ['hold', 'held', 'held', 'tenir', 'həʊld|held|held'],
  ['hurt', 'hurt', 'hurt', 'blesser, faire mal', 'hɜːt|hɜːt|hɜːt'],
  ['keep', 'kept', 'kept', 'garder', 'kiːp|kept|kept'],
  ['kneel', 'knelt', 'knelt', "s'agenouiller", 'niːl|nelt|nelt'],
  ['knit', 'knit', 'knit', 'tricoter', 'nɪt|nɪt|nɪt'],
  ['know', 'knew', 'known', 'savoir, connaître', 'nəʊ|njuː|nəʊn'],
  ['lay', 'laid', 'laid', 'dresser, disposer', 'leɪ|leɪd|leɪd'],
  ['lead', 'led', 'led', 'mener, guider', 'liːd|led|led'],
  ['learn', 'learnt', 'learnt', 'apprendre', 'lɜːn|lɜːnt|lɜːnt'],
  ['leave', 'left', 'left', 'partir, laisser', 'liːv|left|left'],
  ['lend', 'lent', 'lent', 'prêter', 'lend|lent|lent'],
  ['let', 'let', 'let', 'permettre', 'let|let|let'],
  ['lie', 'lay', 'lain', "s'étendre, s'allonger", 'laɪ|leɪ|leɪn'],
  ['light', 'lit', 'lit', 'allumer', 'laɪt|lɪt|lɪt'],
  ['lose', 'lost', 'lost', 'perdre', 'luːz|lɒst|lɒst'],
  ['make', 'made', 'made', 'faire, fabriquer', 'meɪk|meɪd|meɪd'],
  ['mean', 'meant', 'meant', 'vouloir dire, signifier', 'miːn|ment|ment'],
  ['meet', 'met', 'met', '(se) rencontrer', 'miːt|met|met'],
  ['mistake', 'mistook', 'mistaken', 'confondre', 'mɪˈsteɪk|mɪˈstʊk|mɪˈsteɪkən'],
  ['pay', 'paid', 'paid', 'payer', 'peɪ|peɪd|peɪd'],

  // ---- Page 161, colonne de gauche ----
  ['put', 'put', 'put', 'mettre, poser', 'pʊt|pʊt|pʊt'],
  ['read', 'read', 'read', 'lire', 'riːd|red|red'],
  ['ride', 'rode', 'ridden', 'aller à cheval, moto', 'raɪd|rəʊd|ˈrɪdən'],
  ['ring', 'rang', 'rung', 'sonner', 'rɪŋ|ræŋ|rʌŋ'],
  ['rise', 'rose', 'risen', 'se lever', 'raɪz|rəʊz|ˈrɪzən'],
  ['run', 'ran', 'run', 'courir', 'rʌn|ræn|rʌn'],
  ['say', 'said', 'said', 'dire', 'seɪ|sed|sed'],
  ['see', 'saw', 'seen', 'voir', 'siː|sɔː|siːn'],
  ['seek', 'sought', 'sought', 'rechercher', 'siːk|sɔːt|sɔːt'],
  ['sell', 'sold', 'sold', 'vendre', 'sel|səʊld|səʊld'],
  ['send', 'sent', 'sent', 'envoyer', 'send|sent|sent'],
  ['set', 'set', 'set', 'placer, fixer', 'set|set|set'],
  ['sew', 'sewed', 'sewn', 'coudre', 'səʊ|səʊd|səʊn'],
  ['shake', 'shook', 'shaken', 'secouer', 'ʃeɪk|ʃʊk|ˈʃeɪkən'],
  ['shave', 'shaved', 'shaven', 'raser', 'ʃeɪv|ʃeɪvd|ˈʃeɪvən'],
  ['shine', 'shone', 'shone', 'briller', 'ʃaɪn|ʃɒn|ʃɒn'],
  ['shoot', 'shot', 'shot', 'tirer, filmer', 'ʃuːt|ʃɒt|ʃɒt'],
  ['show', 'showed', 'shown', 'montrer', 'ʃəʊ|ʃəʊd|ʃəʊn'],
  ['shut', 'shut', 'shut', 'fermer', 'ʃʌt|ʃʌt|ʃʌt'],
  ['sing', 'sang', 'sung', 'chanter', 'sɪŋ|sæŋ|sʌŋ'],
  ['sink', 'sank', 'sunk', 'couler', 'sɪŋk|sæŋk|sʌŋk'],
  ['sit', 'sat', 'sat', 'être assis', 'sɪt|sæt|sæt'],
  ['sleep', 'slept', 'slept', 'dormir', 'sliːp|slept|slept'],
  ['slide', 'slid', 'slid', 'glisser', 'slaɪd|slɪd|slɪd'],
  ['smell', 'smelt', 'smelt', 'sentir', 'smel|smelt|smelt'],
  ['speak', 'spoke', 'spoken', 'parler', 'spiːk|spəʊk|ˈspəʊkən'],

  // ---- Page 161, colonne de droite ----
  ['spell', 'spelt', 'spelt', 'épeler', 'spel|spelt|spelt'],
  ['spend', 'spent', 'spent', 'dépenser, passer (temps)', 'spend|spent|spent'],
  ['spill', 'spilt', 'spilt', 'renverser', 'spɪl|spɪlt|spɪlt'],
  ['spin', 'spun', 'spun', 'tournoyer, pédaler', 'spɪn|spʌn|spʌn'],
  ['spring', 'sprang', 'sprung', 'jaillir, bondir', 'sprɪŋ|spræŋ|sprʌŋ'],
  ['spit', 'spat', 'spat', 'cracher', 'spɪt|spæt|spæt'],
  ['spoil', 'spoilt', 'spoilt', 'gâter, gâcher', 'spɔɪl|spɔɪlt|spɔɪlt'],
  ['spread', 'spread', 'spread', 'étaler, tartiner', 'spred|spred|spred'],
  ['stand', 'stood', 'stood', 'être debout', 'stænd|stʊd|stʊd'],
  ['steal', 'stole', 'stolen', 'voler', 'stiːl|stəʊl|ˈstəʊlən'],
  ['stick', 'stuck', 'stuck', 'coller', 'stɪk|stʌk|stʌk'],
  ['sting', 'stung', 'stung', 'piquer', 'stɪŋ|stʌŋ|stʌŋ'],
  ['strike', 'struck', 'struck', 'frapper', 'straɪk|strʌk|strʌk'],
  ['swear', 'swore', 'sworn', 'jurer', 'sweə|swɔː|swɔːn'],
  ['sweep', 'swept', 'swept', 'balayer', 'swiːp|swept|swept'],
  ['swell', 'swelled', 'swollen', 'enfler', 'swel|sweld|ˈswəʊlən'],
  ['swim', 'swam', 'swum', 'nager', 'swɪm|swæm|swʌm'],
  ['swing', 'swung', 'swung', 'balancer', 'swɪŋ|swʌŋ|swʌŋ'],
  ['take', 'took', 'taken', 'prendre', 'teɪk|tʊk|ˈteɪkən'],
  ['tear', 'tore', 'torn', 'déchirer', 'teə|tɔː|tɔːn'],
  ['tell', 'told', 'told', 'dire, raconter', 'tel|təʊld|təʊld'],
  ['think', 'thought', 'thought', 'penser', 'θɪŋk|θɔːt|θɔːt'],
  ['throw', 'threw', 'thrown', 'jeter', 'θrəʊ|θruː|θrəʊn'],
] as const satisfies readonly Row[];

/** Un infinitif de la liste (typé : une faute de frappe dans la config est détectée au build). */
export type VerbBase = (typeof ROWS)[number][0];

/**
 * Variantes correctes acceptées EN PLUS de la forme du manuel
 * (ex. « learned » est juste même si le manuel donne « learnt »).
 */
const ACCEPTED: Partial<Record<VerbBase, NonNullable<Verb['accepted']>>> = {
  burn: { preterite: ['burned'], pastParticiple: ['burned'] },
  dream: { preterite: ['dreamed'], pastParticiple: ['dreamed'] },
  kneel: { preterite: ['kneeled'], pastParticiple: ['kneeled'] },
  knit: { preterite: ['knitted'], pastParticiple: ['knitted'] },
  learn: { preterite: ['learned'], pastParticiple: ['learned'] },
  light: { preterite: ['lighted'], pastParticiple: ['lighted'] },
  sew: { pastParticiple: ['sewed'] },
  shave: { pastParticiple: ['shaved'] },
  show: { pastParticiple: ['showed'] },
  smell: { preterite: ['smelled'], pastParticiple: ['smelled'] },
  spell: { preterite: ['spelled'], pastParticiple: ['spelled'] },
  spill: { preterite: ['spilled'], pastParticiple: ['spilled'] },
  spoil: { preterite: ['spoiled'], pastParticiple: ['spoiled'] },
  swell: { pastParticiple: ['swelled'] },
};

/** « əˈweɪk, foo » -> « /əˈweɪk/, /foo/ » */
const toSlashed = (segment: string): string =>
  segment
    .split(',')
    .map((s) => `/${s.trim()}/`)
    .join(', ');

/** Liste complète des verbes du manuel, dans l'ordre. */
export const allVerbs: Verb[] = ROWS.map((row, index): Verb => {
  const [base, preterite, pastParticiple, translation, ipa] = row;
  const [ipaBase = '', ipaPreterite = '', ipaParticiple = ''] = ipa.split('|');
  const accepted = ACCEPTED[base];
  return {
    id: `to-${base}`,
    order: index + 1,
    base,
    preterite,
    pastParticiple,
    translation,
    ...(accepted ? { accepted } : {}),
    phonetics: {
      base: toSlashed(ipaBase),
      preterite: toSlashed(ipaPreterite),
      pastParticiple: toSlashed(ipaParticiple),
    },
  };
});

/** Accès rapide à un verbe par son id. */
export const verbsById: Record<string, Verb> = Object.fromEntries(
  allVerbs.map((verb) => [verb.id, verb]),
);
