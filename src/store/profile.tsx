import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { UserProfile, UserSettings, Verb } from '@/types';
import { activeVerbs } from '@/data/curriculum';
import {
  applyAnswer,
  completeSession as completeSessionFn,
  createDefaultProfile,
  decayStreak,
  recordBossScore as recordBossScoreFn,
} from '@/lib/profile';
import { loadProfile, saveProfile } from '@/lib/storage';

/**
 * Store global du profil élève : contexte React + useReducer,
 * persisté automatiquement dans le LocalStorage à chaque changement.
 */

type Action =
  | { type: 'ANSWER'; verb: Verb; correct: boolean; now: number }
  | { type: 'COMPLETE_SESSION'; perfect: boolean; now: number }
  | { type: 'BOSS_SCORE'; score: number; now: number }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<UserSettings> }
  | { type: 'RESET' };

function reducer(state: UserProfile, action: Action): UserProfile {
  switch (action.type) {
    case 'ANSWER':
      return applyAnswer(state, action.verb, action.correct, activeVerbs, action.now);
    case 'COMPLETE_SESSION':
      return completeSessionFn(state, action.perfect, activeVerbs, action.now);
    case 'BOSS_SCORE':
      return recordBossScoreFn(state, action.score, activeVerbs, action.now);
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'RESET':
      return createDefaultProfile();
    default:
      return state;
  }
}

/** Initialisation paresseuse : charge le profil puis fait retomber la flamme si besoin. */
function init(): UserProfile {
  const loaded = loadProfile();
  const streak = decayStreak(loaded.streak, Date.now());
  return streak === loaded.streak ? loaded : { ...loaded, streak };
}

interface ProfileContextValue {
  profile: UserProfile;
  answer: (verb: Verb, correct: boolean) => void;
  completeSession: (perfect: boolean) => void;
  recordBossScore: (score: number) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  reset: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, dispatch] = useReducer(reducer, undefined, init);

  // Persistance automatique
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const answer = useCallback((verb: Verb, correct: boolean) => {
    dispatch({ type: 'ANSWER', verb, correct, now: Date.now() });
  }, []);

  const completeSession = useCallback((perfect: boolean) => {
    dispatch({ type: 'COMPLETE_SESSION', perfect, now: Date.now() });
  }, []);

  const recordBossScore = useCallback((score: number) => {
    dispatch({ type: 'BOSS_SCORE', score, now: Date.now() });
  }, []);

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, answer, completeSession, recordBossScore, updateSettings, reset }),
    [profile, answer, completeSession, recordBossScore, updateSettings, reset],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

/** Hook d'accès au profil et aux actions. */
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile doit être utilisé à l’intérieur de <ProfileProvider>.');
  return ctx;
}
