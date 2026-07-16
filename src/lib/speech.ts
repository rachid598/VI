/**
 * Synthèse vocale native du navigateur (SpeechSynthesis) — 100 % offline.
 * Utilisée pour prononcer les verbes en anglais britannique.
 */

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (!canSpeak()) return null;
  const voices = window.speechSynthesis.getVoices();
  const enGB = voices.find((v) => v.lang === 'en-GB');
  const anyEn = voices.find((v) => v.lang?.toLowerCase().startsWith('en'));
  return enGB ?? anyEn ?? null;
}

/** Extrait le premier mot prononçable (ex. "was / were" -> "was"). */
export function firstWord(text: string): string {
  return text.split(/[/,]/)[0]!.trim();
}

/** Prononce un mot/expression en anglais (voix britannique si disponible). */
export function speak(text: string, rate = 0.9): void {
  if (!canSpeak() || !text.trim()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = rate;
  cachedVoice ??= pickVoice();
  if (cachedVoice) utterance.voice = cachedVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
