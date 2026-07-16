# ⚡ Verbes Héros — Verbes irréguliers anglais (PWA)

Application web progressive (PWA) pour aider les **collégiens français** à réviser
leurs **verbes irréguliers anglais** de façon ludique : niveaux, répétition
espacée, mode Boss Rush, XP, flammes (streak) et badges.

> 🇬🇧 Variété de référence : **anglais britannique**.

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
    │   └── index.ts           # ✅ Verb, UserProfile, Level, badges…
    ├── data/
    │   ├── verbs.ts           # ✅ contenu (Niveau 1 : 15 verbes)
    │   └── levels.ts          # métadonnées des niveaux
    ├── components/            # briques UI réutilisables
    │   ├── StatPill.tsx
    │   └── LevelCard.tsx
    ├── screens/               # écrans complets
    │   └── HomeScreen.tsx
    ├── store/                 # (étape 2) état + LocalStorage
    ├── lib/                   # (étape 2) moteur SRS, correction, audio
    └── hooks/                 # (étape 2) hooks React
```

Les dossiers `store/`, `lib/` et `hooks/` seront créés aux étapes suivantes
(gestion d'état, répétition espacée, correction des réponses, synthèse vocale).

## 🗺️ Feuille de route

- [x] **Étape 1** — Squelette Vite/React/Tailwind/PWA + types + données (N1).
- [ ] **Étape 2** — Store `UserProfile` (LocalStorage) + moteur de répétition espacée.
- [ ] **Étape 3** — Écran d'entraînement (feedback vert/rouge, correction, phonétique).
- [ ] **Étape 4** — Mode Boss Rush (chrono 60 s, barre de vie).
- [ ] **Étape 5** — XP, flammes (streak), badges et écran de collection.
- [ ] **Étape 6** — Niveaux 2 à 5 (invariables, changeants, jumeaux, pièges).
