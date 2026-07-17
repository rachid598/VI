import { Eye, GraduationCap, Trash2, Volume2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserSettings } from '@/types';
import { useProfile } from '@/store/profile';
import { useNav } from '@/store/navigation';

interface ToggleRowProps {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/10"
    >
      <Icon size={20} className="shrink-0 text-brand-300" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-black text-white">{label}</div>
        <div className="text-[11px] text-slate-400">{description}</div>
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand-500' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

export function SettingsScreen() {
  const { profile, updateSettings, reset } = useProfile();
  const { navigate } = useNav();
  const s = profile.settings;

  const set = (key: keyof UserSettings) => (value: boolean) => updateSettings({ [key]: value });

  const handleReset = () => {
    const ok = window.confirm(
      'Réinitialiser toute ta progression (XP, flamme, badges, verbes maîtrisés) ? Action irréversible.',
    );
    if (ok) {
      reset();
      navigate({ name: 'home' });
    }
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-28 pt-6">
      <h1 className="mb-6 text-2xl font-black text-white">Réglages</h1>

      <h2 className="mb-3 px-1 text-sm font-black uppercase tracking-wider text-slate-400">
        Mode de jeu
      </h2>
      <div className="mb-8 flex flex-col gap-3">
        <ToggleRow
          icon={GraduationCap}
          label="Mode expert : deviner l'infinitif"
          description="N'affiche que la traduction française : à toi de trouver les 3 formes (infinitif, prétérit, participe passé)."
          checked={s.guessInfinitive}
          onChange={set('guessInfinitive')}
        />
      </div>

      <h2 className="mb-3 px-1 text-sm font-black uppercase tracking-wider text-slate-400">
        Affichage
      </h2>
      <div className="flex flex-col gap-3">
        <ToggleRow
          icon={Volume2}
          label="Prononciation audio"
          description="Écouter les verbes (synthèse vocale)."
          checked={s.sound}
          onChange={set('sound')}
        />
        <ToggleRow
          icon={Eye}
          label="Afficher la phonétique"
          description="Montrer la prononciation écrite (ex. /ɡəʊ/)."
          checked={s.showPhonetics}
          onChange={set('showPhonetics')}
        />
        <ToggleRow
          icon={Zap}
          label="Réduire les animations"
          description="Pour plus de confort ou moins de distractions."
          checked={s.reduceMotion}
          onChange={set('reduceMotion')}
        />
      </div>

      <h2 className="mb-3 mt-8 px-1 text-sm font-black uppercase tracking-wider text-slate-400">
        Zone sensible
      </h2>
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-wrong)]/15 py-3.5 text-sm font-black text-[color:var(--color-wrong)] ring-1 ring-[color:var(--color-wrong)]/30 transition-transform active:scale-[0.98]"
      >
        <Trash2 size={18} /> Réinitialiser ma progression
      </button>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-500">
        Verbes Héros — 100 % hors-ligne, aucune donnée envoyée.
        <br />
        Ta progression est enregistrée sur cet appareil uniquement.
      </p>
    </div>
  );
}
