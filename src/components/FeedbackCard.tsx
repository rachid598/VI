import { Check, Volume2, X } from 'lucide-react';
import type { FormKey, GradedAnswer, Verb } from '@/types';
import { canSpeak, firstWord, speak } from '@/lib/speech';

interface FeedbackCardProps {
  verb: Verb;
  graded: GradedAnswer;
  showPhonetics: boolean;
  sound: boolean;
}

const formLabel: Record<FormKey, string> = {
  base: 'Infinitif',
  preterite: 'Prétérit',
  pastParticiple: 'Participe passé',
};

/** Carte de correction affichée après une réponse (vert/rouge + prononciation). */
export function FeedbackCard({ verb, graded, showPhonetics, sound }: FeedbackCardProps) {
  const ok = graded.correct;
  const accent = ok ? 'var(--color-correct)' : 'var(--color-wrong)';

  return (
    <div
      className="anim-pop rounded-3xl p-4 ring-1"
      style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`, borderColor: accent }}
    >
      <div className="mb-3 flex items-center gap-2 text-base font-black" style={{ color: accent }}>
        {ok ? <Check size={20} /> : <X size={20} />}
        {ok ? 'Bravo !' : 'Presque… mémorise :'}
      </div>

      <div className="flex flex-col gap-2">
        {graded.forms.map((f) => {
          const phonetic = showPhonetics ? verb.phonetics?.[f.form] : undefined;
          return (
            <div key={f.form} className="flex items-center gap-2 rounded-2xl bg-black/20 px-3 py-2">
              <span className="w-28 shrink-0 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {formLabel[f.form]}
              </span>
              <span
                className="font-black"
                style={{ color: f.correct ? 'var(--color-correct)' : 'var(--color-wrong)' }}
              >
                {f.expected}
              </span>
              {phonetic && <span className="text-xs text-slate-400">{phonetic}</span>}
              {sound && canSpeak() && (
                <button
                  type="button"
                  onClick={() => speak(firstWord(f.expected))}
                  aria-label={`Écouter ${f.expected}`}
                  className="ml-auto rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <Volume2 size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
