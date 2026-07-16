export type FieldStatus = 'idle' | 'correct' | 'wrong';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  status?: FieldStatus;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const ringByStatus: Record<FieldStatus, string> = {
  idle: 'ring-white/10 focus-within:ring-brand-400',
  correct: 'ring-[color:var(--color-correct)]',
  wrong: 'ring-[color:var(--color-wrong)]',
};

/** Champ de saisie d'une forme verbale, coloré selon la correction. */
export function FormField({
  label,
  value,
  onChange,
  status = 'idle',
  disabled = false,
  placeholder,
  autoFocus = false,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        autoComplete="off"
        enterKeyHint="done"
        className={`w-full rounded-2xl bg-night-800 px-4 py-3 text-lg font-bold text-white outline-none ring-2 transition placeholder:text-slate-600 disabled:opacity-90 ${ringByStatus[status]}`}
      />
    </label>
  );
}
