# ⚡ Verbes Héros — Verbes irréguliers anglais (PWA)

Application web progressive (PWA) pour aider les **collégiens français** à réviser
leurs **verbes irréguliers anglais** de façon ludique : répétition espacée,
mode Boss Rush, XP, flammes (streak) et badges.

> 🇬🇧 Variété de référence : **anglais britannique**.

## 🎓 Programme de la classe (pour l'enseignant)

La liste complète du manuel (**119 verbes**, « Précis grammatical n°27 »,
pp. 160-161) est dans `src/data/verbs.ts`, dans l'ordre du manuel. Mais les
élèves ne s'entraînent **que sur les verbes ouverts**, définis en **un seul
endroit** : `src/data/curriculum.ts`.

```ts
export const ACTIVE_BASES = ['cast', 'catch', 'choose', 'cling', 'come'];
```

Pour ouvrir de nouveaux verbes, ajoute leurs infinitifs à cette liste puis
déploie : entraînement, révision mélangée, Boss Rush et badges suivent
automatiquement. Une faute de frappe fait échouer le build (le site en ligne
reste alors inchangé).

## 🛠️ Stack technique

| Domaine    | Choix                                             |
| ---------- | ------------------------------------------------- |
| Build      | **Vite 6**                                        |
| Framework  | **React 19** + **TypeScript** (mode `strict`)     |
| UI         | **Tailwind CSS v4** (mobile-first)                |
| Icônes     | **lucide-react**                                  |
| PWA        | **vite-plugin-pwa** (offline, service worker)     |
| Données    | **LocalStorage** (aucun backend, aucun compte)    |

## 🚀 Démarrage

```bash
npm install
npm run dev        # serveur de dev
npm run build      # build de production (tsc + vite)
npm run preview    # prévisualise le build (teste la PWA / offline)
npm run icons      # régénère les icônes PWA (nécessite Python + Pillow)
```

## ☁️ Déploiement (Cloudflare Pages)

⚠️ **Écran blanc = mauvais réglage de build.** Cloudflare doit servir le dossier
`dist/` généré, **pas** la racine du dépôt (qui contient un `index.html` de
développement pointant vers `/src/main.tsx`, non exécutable par le navigateur).

Dans **Cloudflare Pages → ton projet → Settings → Builds & deployments** :

| Réglage                     | Valeur          |
| --------------------------- | --------------- |
| Framework preset            | `Vite`          |
| Build command               | `npm run build` |
| Build output directory      | `dist`          |
| Variable d'env. `NODE_VERSION` | `22` (ou via `.nvmrc`) |

Puis **Retry deployment / Redeploy**. En upload direct (`wrangler`), pousse le
dossier `dist` : `npm run build && npx wrangler pages deploy dist`.

## 📁 Architecture des dossiers

```
verbes-irreguliers/
├── index.html                 # point d'entrée HTML (meta PWA, favicon)
├── vite.config.ts             # Vite + Tailwind + PWA (manifest, workbox)
├── tsconfig*.json             # TypeScript strict + alias "@/…"
├── scripts/
│   └── generate_icons.py      # génère les icônes PWA (dégradé + éclair)
├── public/                    # assets statiques (icônes, favicon)
│   ├── favicon.svg
│   ├── icon-192.png / icon-512.png / maskable-512.png
│   └── apple-touch-icon.png
└── src/
    ├── main.tsx               # bootstrap React
    ├── App.tsx                # routeur d'écrans (minimal pour l'instant)
    ├── index.css              # thème Tailwind (@theme) + styles de base
    ├── types/
    │   └── index.ts           # ✅ Verb, UserProfile, Level, session, badges…
    ├── data/
    │   ├── verbs.ts           # ✅ liste complète du manuel : 119 verbes
    │   ├── curriculum.ts      # ✅ verbes OUVERTS aux élèves (à modifier)
    │   └── badges.ts          # catalogue des badges
    ├── lib/                   # ✅ logique métier PURE (testée)
    │   ├── constants.ts       # constantes de jeu réglables
    │   ├── srs.ts             # répétition espacée (Leitner)
    │   ├── grading.ts         # correction des réponses
    │   ├── profile.ts         # XP, streak, badges, mutations du profil
    │   ├── session.ts         # moteur d'une session d'entraînement
    │   ├── storage.ts         # persistance LocalStorage (+ migrations)
    │   ├── speech.ts          # synthèse vocale (prononciation, offline)
    │   └── engine.test.ts     # tests Vitest du moteur
    ├── store/
    │   ├── profile.tsx        # contexte profil + persistance + useProfile()
    │   └── navigation.tsx     # navigation entre écrans + useNav()
    ├── components/            # briques UI réutilisables
    │   ├── StatPill.tsx  PracticeCard.tsx  ProgressBar.tsx
    │   ├── FormField.tsx  FeedbackCard.tsx  BadgeTile.tsx
    │   └── BossHealthBar.tsx  BottomNav.tsx
    └── screens/               # écrans complets
        ├── HomeScreen.tsx       # parcours + accès Boss Rush
        ├── TrainingScreen.tsx   # entraînement (2 formes, feedback, audio)
        ├── SessionSummary.tsx   # récap de fin de session
        ├── BossRushScreen.tsx   # défi chronométré 60 s
        ├── BadgesScreen.tsx     # récompenses & badges
        └── SettingsScreen.tsx   # réglages (audio, phonétique, reset)
```

Tests du moteur : `npm test` (Vitest). La couche `lib/` est composée de
fonctions **pures** (sans effet de bord), donc facile à tester et à faire évoluer.

## 🗺️ Feuille de route

- [x] **Étape 1** — Squelette Vite/React/Tailwind/PWA + types + données (N1).
- [x] **Étape 2** — Store `UserProfile` (LocalStorage) + moteur de répétition espacée (+ tests).
- [x] **Étape 3** — Écran d'entraînement (feedback vert/rouge, correction, phonétique, audio).
- [x] **Étape 4** — Mode Boss Rush (chrono 60 s, barre de vie, combos).
- [x] **Étape 5** — XP, flammes (streak), badges et écran de collection + réglages.
- [x] **Étape 6** — Liste complète du manuel (119 verbes) + lot ouvert aux élèves configurable (`data/curriculum.ts`).
- [x] **Bonus** — Mode **Révision mélangée**, et mode **Expert** (n'affiche que le français : deviner les 3 formes).
