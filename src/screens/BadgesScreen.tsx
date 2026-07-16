import { Flame, Sparkles, Star, Trophy } from 'lucide-react';
import { badges } from '@/data/badges';
import { allVerbs } from '@/data/verbs';
import { useProfile } from '@/store/profile';
import { studentLevel } from '@/lib/profile';
import { isMastered } from '@/lib/srs';
import { BadgeTile } from '@/components/BadgeTile';

export function BadgesScreen() {
  const { profile } = useProfile();

  const masteredCount = allVerbs.filter((v) => isMastered(profile.progress[v.id])).length;
  const unlockedBadges = badges.filter((b) => profile.badges[b.id] != null).length;

  const stats = [
    { icon: Star, label: 'Niveau', value: studentLevel(profile.xp), color: '#a5b4fc' },
    { icon: Trophy, label: 'XP', value: profile.xp, color: '#facc15' },
    { icon: Flame, label: 'Flamme', value: profile.streak.current, color: '#f97316' },
    { icon: Sparkles, label: 'Maîtrisés', value: masteredCount, color: '#22c55e' },
  ];

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-28 pt-6">
      <h1 className="mb-1 text-2xl font-black text-white">Récompenses</h1>
      <p className="mb-6 text-sm text-slate-400">
        {unlockedBadges}/{badges.length} badges débloqués — record Boss&nbsp;: {profile.stats.bestBossScore}
      </p>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-4 gap-2">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10">
            <Icon size={18} className="mx-auto" style={{ color }} />
            <div className="mt-1 text-lg font-black text-white">{value}</div>
            <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <h2 className="mb-3 px-1 text-sm font-black uppercase tracking-wider text-slate-400">Badges</h2>
      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <BadgeTile key={badge.id} badge={badge} unlocked={profile.badges[badge.id] != null} />
        ))}
      </div>
    </div>
  );
}
