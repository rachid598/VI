interface ProgressBarProps {
  /** Pourcentage 0–100. */
  value: number;
  className?: string;
}

/** Barre de progression dégradée (session, niveau…). */
export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-white/10 ${className ?? ''}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-[#8b5cf6] transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
