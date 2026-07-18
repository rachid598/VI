# Audit complet — « Suivi des circulations » v1.0.0-rc.3

Audit réalisé sur l'archive `applicationfinalev1.0.0rc.3.zip` (49 fichiers, ~19 000 lignes
hors CSS). Périmètre : sécurité, architecture, qualité de code, RGPD/vie privée,
exploitation, puis propositions de nouvelles fonctionnalités.

---

## 1. Verdict global

**Très bon niveau, nettement au-dessus de ce qu'on voit habituellement pour un outil
interne d'établissement.** Le code est cohérent, commenté avec discernement (les
commentaires expliquent le *pourquoi*), et la philosophie produit (« un signalement à
vérifier, jamais une sanction automatique ») est réellement traduite dans le code, pas
seulement dans la documentation. La version candidate est méritée : l'application est
proche d'un état publiable en production.

Les deux vrais manques ne sont pas des failles mais des risques structurels :
**aucun test automatisé** sur 19 000 lignes, et **deux fichiers monolithes**
(`ApiController.php` ~3 900 lignes, `app.js` ~3 300 lignes) qui rendront chaque
évolution future plus risquée.

---

## 2. Points forts constatés (vérifiés dans le code)

### Sécurité applicative
- **SQL** : 100 % de requêtes préparées PDO, `EMULATE_PREPARES=false`, aucun assemblage
  de SQL avec des données utilisateur trouvé.
- **XSS** : `escapeHtml()` appliqué systématiquement dans `app.js` (vérifié sur tous les
  écrans à interpolation), CSP stricte sans script inline (`script-src 'self'`) à la fois
  en `.htaccess`, en meta HTML et dans `install.php`.
- **CSRF** : jeton par session + en-tête `X-CSRF-Token` exigé sur toute mutation,
  cookie `SameSite=Lax`, export CSV volontairement en POST + CSRF + trace d'audit.
- **Sessions** : `use_strict_mode`, régénération d'identifiant à la connexion puis
  rotation périodique, expiration absolue (pas seulement d'inactivité), cookie limité au
  chemin de l'installation (cohabitation test/prod propre).
- **LDAP** : échappement systématique des filtres (`ldap_escape`), refus explicite du
  mot de passe vide (protection contre le *unauthenticated bind*), timeouts réseau et
  limites de résultats sur chaque recherche.
- **Force brute** : rate limiting en base par compte+IP **et** par IP seule, identifiants
  hachés en HMAC (pas d'IP en clair stockée), purge bornée à chaque passage.
- **Fuites d'information** : `display_errors=0`, `zend.exception_ignore_args=1` (les mots
  de passe ne peuvent pas apparaître dans une trace), erreurs 500 avec référence courte
  journalisée sans le message brut. C'est rarement aussi soigné.
- **`.htaccess`** : tous les dossiers sensibles (`src`, `var`, `database`, `donnees`,
  `tools`) refusés, fichiers `.md`/`.sql`/`settings.php` bloqués à la racine.
- **CSV** : neutralisation de l'injection de formules Excel (`safeCsvCell`, préfixe `'`
  sur `=+-@`).
- **Écriture de `settings.php`** : atomique, permissions 0600 vérifiées après coup,
  rollback complet de l'installation en cas d'échec (libération de la liaison MySQL).

### Architecture et robustesse
- **Idempotence des envois** : la `submission_key` (clé unique par auteur+élève) fait
  qu'une reprise après coupure réseau renvoie le résultat déjà créé au lieu de dupliquer.
  C'est une vraie brique « offline-ready » déjà en place côté serveur.
- **Liaison installation ↔ base** (`installation_id` + `scope_hash` + verrou MySQL) :
  impossible de croiser accidentellement test et production, ou de copier un
  `settings.php` d'un dossier vers l'autre. Excellente idée, bien exécutée.
- **Migrations versionnées en base** (pas de marqueur fichier), verrou `GET_LOCK` global
  qui sérialise mutations métier et sauvegardes/restaurations.
- **Instantanés de récupération** : HMAC d'authenticité, plafonds (400 points, 512 Mio,
  anti « zip bomb » à la décompression), périmètre volontairement limité aux données
  élèves (jamais les comptes, rôles ou audits) — les gardes-fous documentés dans
  `PRODUCT.md` sont réellement implémentés.
- **Audit** : le journal est inséré *dans la même transaction* que l'action métier.
- **Rôle admin non délégable** : réservé aux `bootstrap_admins` de `settings.php`, avec
  neutralisation d'une ancienne attribution devenue invalide (`AuthService::user()`).

### Vie privée / RGPD
- Rétentions configurées (observations 120 j, audit 365 j, tentatives de connexion 30 j)
  avec outil de purge CLI en mode simulation par défaut.
- Rapport anonymisé avec seuil de k-anonymat (effectifs < 3 masqués).
- Clôture d'année produisant uniquement des agrégats anonymisés.
- Aucune donnée personnelle dans le cache PWA (le service worker ne met en cache que le
  shell statique et force `no-store` sur l'API).

### Documentation
Dix fichiers de documentation cohérents entre eux, un `PRODUCT.md` qui fixe le cadre
déontologique, des notes de mise à jour par version. C'est un vrai plus pour la reprise
du projet par quelqu'un d'autre.

---

## 3. Constats et recommandations

### 🔴 Priorité haute

**A. Aucun test automatisé.**
C'est le risque n° 1 du projet : chaque correction future peut casser silencieusement la
validation chronologique, le calcul de points ou l'anti-doublon. Beaucoup de logique est
pourtant testable sans serveur : `pointsBalance()`, `trimesterWindow()`,
`parseStudentsCsv()`, `safeCsvCell()`, `schoolTimeSlot()`, la normalisation LDAP…
→ Ajouter PHPUnit avec une base MySQL de test (ou SQLite pour les fonctions pures) et
viser d'abord les 10 fonctions de calcul les plus critiques. Même 30 tests changeraient
la donne avant la 1.0.0 finale.

**B. PHP 7.4 comme minimum supporté.**
PHP 7.4 est en fin de vie depuis novembre 2022 (plus aucun correctif de sécurité). Le
code semble compatible 8.x (pas de construction dépréciée relevée).
→ Valider explicitement sous PHP 8.2/8.3 et relever le minimum dès que le serveur Kwartz
le permet ; en attendant, documenter la version PHP réellement déployée.

### 🟠 Priorité moyenne

**C. Monolithes `ApiController.php` (3 884 lignes) et `app.js` (3 315 lignes).**
Le découpage en services est bien commencé (`DigitalPassService`, `FinalAdminService`,
`RecoveryService`) ; le reste du contrôleur mélange encore observations, points, imports
et administration.
→ Poursuivre l'extraction (`ObservationService`, `PointsService`, `StudentImportService`)
et découper `app.js` en modules ES. Côté front, tout repose sur la discipline d'appeler
`escapeHtml()` dans des gabarits `innerHTML` : un seul oubli futur = XSS. Une petite
fonction de gabarit centralisée (ou des éléments `<template>`) réduirait ce risque
structurel.

**D. LDAP en clair, URI figée.**
`ldap://127.0.0.1:389` avec `use_starttls => false` est codé en dur dans `install.php`.
Acceptable tant que l'annuaire est sur la même machine (loopback), mais les mots de passe
transiteraient en clair si l'annuaire était un jour déporté.
→ Exposer l'URI et StartTLS dans l'installateur, ou au minimum documenter la contrainte
« annuaire local uniquement ».

**E. La purge de rétention n'est pas planifiée.**
`tools/cleanup.php` est CLI et manuel (bon choix de sécurité), mais si personne ne le
lance, les durées de conservation annoncées (120 jours) ne sont pas effectives — c'est un
engagement RGPD non tenu par défaut.
→ Documenter un cron mensuel (simulation + rapport, puis `--apply` après contrôle), ou
ajouter un rappel dans l'écran « santé » quand la dernière purge date de plus de X mois.

**F. Un seul administrateur de secours.**
Le formulaire d'installation n'accepte qu'un `admin_uid`, alors que la configuration
supporte un tableau `bootstrap_admins`. Si ce compte LDAP disparaît, il faut éditer
`settings.php` à la main.
→ Permettre d'en déclarer deux à l'installation, et documenter la procédure de secours.

### 🟡 Priorité basse / détails

- **Jokers LIKE non échappés** (`ApiController.php:333`) : un utilisateur authentifié
  peut taper `%` et lister 12 élèves arbitraires. Impact très faible (la recherche fait
  partie de son rôle), mais échapper `%`/`_` rendrait la recherche strictement littérale.
- **Frontière de trimestre en UTC** (`trimesterWindow()`, `ApiController.php:3274`) :
  la comparaison utilise `gmdate()` alors que les bornes sont des dates locales — le
  basculement de trimestre se fait à 1–2 h de décalage autour de minuit. Anecdotique.
- **`install.php` reste accessible après installation** : il refuse proprement de
  réinstaller, mais le supprimer (ou l'auto-renommer) après succès réduirait la surface.
- **Versionnage manuel des assets** (`?v=25`, `shell-v24` dans le service worker) :
  facile à oublier lors d'une livraison ; dériver ces numéros du fichier `VERSION`
  éviterait un cache PWA obsolète.
- **En-têtes de sécurité dépendants de `mod_headers`/`AllowOverride`** : `bootstrap.php`
  renvoie bien ses propres en-têtes pour l'API, mais les fichiers statiques dépendent du
  `.htaccess`. À vérifier une fois sur le serveur réel (`curl -I`).
- **Dix fichiers Markdown à la racine** : un dossier `docs/` clarifierait l'archive.

**Aucune vulnérabilité exploitable identifiée** (injection SQL/LDAP, XSS, CSRF, fixation
de session, IDOR sur les 40 actions de l'API : contrôles de rôle vérifiés un par un).

---

## 4. Nouvelles fonctionnalités proposées

Classées par rapport effort/valeur, en restant dans la philosophie du produit (aide au
discernement, jamais de sanction automatique, sobriété, vie privée).

### Gains rapides (s'appuient sur l'existant)

1. **Saisie hors-ligne avec file d'attente locale.** Le serveur est déjà idempotent
   (`submission_key`) : il « suffit » de mettre les envois échoués en file dans
   IndexedDB et de les rejouer au retour du réseau. C'est LA fonctionnalité naturelle de
   cette architecture — un surveillant en mouvement n'a pas toujours du Wi-Fi. Attention :
   chiffrer/purger la file locale (pas de données élèves persistantes en clair).
2. **Comparaison année N vs N-1 dans le bilan.** Les agrégats anonymisés des années
   clôturées sont déjà stockés (`annual_aggregates`) mais peu exploités : afficher les
   tendances par lieu/créneau d'une année sur l'autre ne demande aucune donnée nominative
   supplémentaire.
3. **Export chiffré téléchargeable des points de récupération.** La documentation répète
   honnêtement que les instantanés « ne sont pas une sauvegarde hors serveur » : proposer
   un export chiffré (AES-GCM avec phrase secrète saisie par l'admin) téléchargeable
   depuis la WebUI comblerait exactement cette limite.
4. **File « actions éducatives à suivre » avec échéances.** Les seuils franchis sont déjà
   journalisés ; un écran regroupant les actions non réalisées (avec ancienneté) aiderait
   les CPE sans rien automatiser.
5. **Export CSV du journal d'audit** (filtré par action/période) pour les contrôles —
   l'écran de consultation existe déjà, l'export non.

### Chantiers moyens

6. **Résumé hebdomadaire interne pour les PP.** Une notification interne (jamais d'email)
   « votre classe : X constats confirmés cette semaine » à la première connexion de la
   semaine — le canal de notification interne existe déjà.
7. **TOTP optionnel pour l'administrateur.** Le LDAP ne fait pas de 2FA ; un second
   facteur uniquement pour le rôle admin (opérations destructives : purge, restauration,
   clôture) serait cohérent avec les réauthentifications déjà exigées.
8. **Généricité établissement.** Le nom « Collège Jean-Jaurès », le logo et les valeurs
   par défaut (Base DN, motif `^c([3-6])g([0-9]{1,2})$`) sont en dur : les rendre
   configurables à l'installation ouvrirait l'application à d'autres établissements
   Kwartz sans toucher au code.
9. **Statistiques d'usage des billets numériques** (anonymisées, par destination et
   créneau) pour objectiver le dispositif au conseil pédagogique.

### À instruire avec prudence

10. **Contexte emploi du temps (import EDT/Pronote).** Afficher « l'élève était attendu
    en salle B12 » au moment de la vérification serait très utile… mais introduit une
    nouvelle source de données personnelles et un couplage fort. À ne faire qu'avec un
    cadrage RGPD explicite et, comme pour les billets, en contexte informatif sans
    décision automatique — le modèle du « contexte minimal immuable » déjà appliqué aux
    billets est le bon gabarit.

---

## 5. Ce que je ferais avant la 1.0.0 finale, dans l'ordre

1. Une vingtaine de tests PHPUnit sur les calculs critiques (points, trimestres, CSV).
2. Validation sous PHP 8.2/8.3 + vérification des en-têtes sur le serveur réel.
3. Cron documenté pour `tools/cleanup.php` (engagement de rétention).
4. Second administrateur de secours dans l'installateur.
5. Ensuite seulement, les fonctionnalités — en commençant par la saisie hors-ligne.
