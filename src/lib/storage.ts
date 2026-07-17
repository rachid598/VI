import type { UserProfile } from '@/types';
import { createDefaultProfile, SCHEMA_VERSION } from './profile';

/** Persistance du profil élève dans le LocalStorage (aucun backend). */

const STORAGE_KEY = 'vi.profile';

export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Renvoie un backend sûr : le vrai localStorage s'il est disponible,
 * sinon un stockage mémoire (navigation privée, quota, SSR…).
 */
export function getDefaultBackend(): StorageBackend {
  try {
    if (typeof localStorage !== 'undefined') {
      const testKey = '__vi_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return localStorage;
    }
  } catch {
    /* on retombe sur la mémoire */
  }
  const mem = new Map<string, string>();
  return {
    getItem: (k) => mem.get(k) ?? null,
    setItem: (k, v) => {
      mem.set(k, v);
    },
    removeItem: (k) => {
      mem.delete(k);
    },
  };
}

/**
 * Complète un profil chargé avec les valeurs par défaut manquantes
 * (nouveaux réglages, nouveaux badges…) sans perdre les données existantes.
 * Sert aussi de migration : le schéma est ramené à la version courante.
 */
function withDefaults(data: UserProfile): UserProfile {
  const def = createDefaultProfile(data.createdAt ?? Date.now());
  return {
    ...def,
    ...data,
    schemaVersion: SCHEMA_VERSION,
    streak: { ...def.streak, ...data.streak },
    stats: { ...def.stats, ...data.stats },
    settings: { ...def.settings, ...data.settings },
    badges: { ...def.badges, ...data.badges },
  };
}

/** Charge le profil (ou en crée un neuf si absent/corrompu). */
export function loadProfile(backend: StorageBackend = getDefaultBackend()): UserProfile {
  const raw = backend.getItem(STORAGE_KEY);
  if (!raw) return createDefaultProfile();
  try {
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed || typeof parsed !== 'object') return createDefaultProfile();
    return withDefaults(parsed);
  } catch {
    return createDefaultProfile();
  }
}

/** Sauvegarde le profil (échec silencieux si quota dépassé). */
export function saveProfile(
  profile: UserProfile,
  backend: StorageBackend = getDefaultBackend(),
): void {
  try {
    backend.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota / mode privé : on ignore */
  }
}

/** Efface le profil (réinitialisation). */
export function clearProfile(backend: StorageBackend = getDefaultBackend()): void {
  backend.removeItem(STORAGE_KEY);
}
