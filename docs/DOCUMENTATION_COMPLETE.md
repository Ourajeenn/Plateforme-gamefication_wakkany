# Wakkany — Documentation complète

Plateforme de gamification familiale : quiz en mode TV, mode bluff, jeu coopératif, quêtes, arbre de talents, avatar, clans et assistant. Cette documentation couvre l'**utilisation** (joueurs et administrateurs), l'**architecture**, la **maintenance** et le **déploiement**.

Elle décrit l'état du dépôt sur la branche `dev` (commit `2295379`, novembre 2026). Les points non vérifiés ou non résolus sont signalés explicitement dans la section 15.

---

## Sommaire

1. Présentation générale
2. Rôles et accès
3. Parcours utilisateur
4. Modules et routes
5. Règles de jeu (scores, quêtes, talents, modes)
6. Assistant RAG et modes d'intervention
7. Administration
8. Architecture technique
9. Modèle de données et migrations
10. Fonctions Edge (Supabase)
11. Configuration et variables d'environnement
12. Installation locale et commandes
13. Tests, qualité et sécurité
14. Déploiement et CI/CD
15. Limites connues et points ouverts
16. Procédures de maintenance
17. Dépannage

---

## 1. Présentation générale

- **Front-end** : React 18 + Vite, application PWA (installable, utilisable hors ligne pour la partie statique).
- **Back-end** : Supabase (PostgreSQL, authentification, Realtime, fonctions Edge en Deno).
- **IA** : Google Gemini (`gemini-2.0-flash`) pour la génération de questions et de quiz, utilisée par des fonctions réservées aux administrateurs. L'assistant conversationnel s'appuie sur une recherche plein texte en base, pas sur un modèle entraîné.
- **Hébergement** : Vercel et Netlify (déploiement automatique depuis GitHub), GitHub Pages (job CI), image Docker nginx.
- **Langue** : interface uniquement en français. Aucune internationalisation n'est en place (voir section 15).

---

## 2. Rôles et accès

| Rôle | Ce qu'il peut faire |
|---|---|
| Visiteur (non connecté) | Page d'accueil, mentions légales, politique de confidentialité. |
| Joueur connecté (`authenticated`) | Profil, quêtes, arbre de talents, avatar, clans, classement, jeux, assistant (selon le mode). |
| Administrateur (`profiles.role = 'admin'`) | Tout le joueur, plus : revue des questions générées, bascule du mode de l'assistant, génération de questions et de quiz par IA. |

Le rôle administrateur est stocké dans `profiles.role`. Il se modifie uniquement en base (SQL), jamais depuis le client.

Les fonctions Edge `generate-questions` et `generate-quiz` vérifient ce rôle côté serveur avant tout appel au modèle.

---

## 3. Parcours utilisateur

1. **Accueil (`/`)** : écran de chargement (preloader) avec le bouton START. Le bouton est activé après un court délai. La musique démarre au premier clic.
2. **Création de profil (`/setup`)** : pseudo, avatar et choix du **clan** (« Meute / Origine ») parmi les cartes : Héros, Guerriers, Ère Primaire (`dinos` dans le code), Pilotes.
3. **Tableau de bord (`/dashboard/:onglet`)** : neuf onglets, décrits en section 4.
4. **Jeux (`/quiz/*`)** : sélection du mode, configuration, lancement d'une partie.
5. **Progression** : chaque victoire ou quête validée rapporte de l'XP, débloque des talents et alimente le flux d'activité.

---

## 4. Modules et routes

### 4.1 Routes principales (`src/pages/App.jsx`)

| Chemin | Écran | Remarque |
|---|---|---|
| `/` | Landing / preloader | Redirige selon l'état de connexion. |
| `/setup` | Création de profil et choix du clan | Obligatoire à la première connexion. |
| `/dashboard/:onglet` | Tableau de bord | Onglet par défaut : `profile`. |
| `/quiz/*` | Ensemble des modes de jeu (`QuizRoutes.jsx`) | Voir 4.2. |
| `/quiz/games` et `/quiz/games/:slug` | Catalogue et fiche de jeu (`GamesPage.jsx`) | Toute route inconnue renvoie vers `/quiz/games`. |
| `/settings` | Paramètres | |
| `/mentions-legales`, `/confidentialite` | Pages légales | |

Les routes inconnues sous `/quiz` renvoient vers `/`.

### 4.2 Routes de jeu (`src/pages/QuizRoutes.jsx`)

| Chemin | Composant | Usage |
|---|---|---|
| `/quiz` | `QuizHome` | Accueil du module quiz. |
| `/quiz/modes` | `QuizModes` | Choix du mode. |
| `/quiz/config` | `QuizConfig` | Paramétrage (joueurs, thème, difficulté). |
| `/quiz/profile` | `PackProfile` | Profil de pack. |
| `/quiz/play` | `FamilyGame` | Quiz en équipes / famille, mode coopératif. |
| `/quiz/bluff` | `BluffRoyal` | Mode bluff. |
| `/quiz/academy` | `AcademyView` | Académie (affichée « Meute » dans l'interface). |
| `/quiz/admin/questions` | `AdminQuestionsReview` | Revue des questions (admin). |
| `/quiz/host` | `HostLobby` | Création d'un salon multijoueur (hôte). |
| `/quiz/join` | `JoinRoom` | Rejoindre un salon. |

Les composants présents dans `src/components/quiz/` comprennent aussi `TriviaQuiz`, `BossRaid`, `TerritoryView`, `GameDashboard`, `LLMQuestionDemo`.

### 4.3 Onglets du tableau de bord (`src/constants/dashboardTabs.js`)

| Identifiant | Libellé | Contenu |
|---|---|---|
| `profile` | Évolution | XP, niveau, progression. |
| `quests` | Quêtes | Liste des quêtes et leur état. |
| `quiz` | Quiz TV | Accès rapide aux jeux. |
| `avatar` | Avatar | Personnalisation et effets (niveaux). |
| `stats` | Stats | Graphiques (recharts). |
| `map` | Carte | Vue territoriale. |
| `skills` | Talents | Arbre de compétences. |
| `clans` | Clan | Informations sur le clan. |
| `rankings` | Rang | Classements (champions, meutes, branches). |

### 4.4 Modules transverses (`src/utils/`)

| Fichier | Rôle |
|---|---|
| `supabaseClient.js`, `isSupabaseConfigured.js` | Client Supabase, détection de la configuration. |
| `progressEvents.js` | Événement `wakkany:progress-changed` : signale qu'une progression a changé. |
| `activityFeed.js` | Publication et lecture du flux d'activité (`activity_events`, canal Realtime `activity_feed`). |
| `assistant.js`, `assistantRAG.js` | Appel de l'assistant et logique de réponse. |
| `scoring.js`, `xpHelpers.js`, `xpSync.integration.test.js` | Calculs et synchronisation de l'XP. |
| `questManager.js`, `territoryManager.js`, `gameStateManager.js` | Logique de jeu. |
| `llmQuestionGenerator.js`, `gameMasterAI.js` | Génération de questions via les fonctions Edge. |
| `rateLimiter.js` | Limitation côté client (complète la limitation serveur). |
| `security.js`, `auth.js`, `e2ee.js` | Sécurité, authentification, chiffrement. |
| `realtime.js`, `offlineQueue.js` | Temps réel et file d'attente hors ligne. |
| `webVitals.js` | Mesures de performance. |

### 4.5 Données statiques (`src/data/`)

| Fichier | Contenu |
|---|---|
| `branches.js` | Arbre de talents : branches `heroes`, `warriors`, `primitives`, `cars` ; nœuds avec `id`, `name`, `xp`, `tier`, `req`, `x`, `y`, `ultimate`. |
| `quests.js` | Définition des quêtes (`nodeReq`, `ultimate`, difficulté). |
| `quests.test.js` | Vérifie la cohérence des quêtes avec l'arbre. |

---

## 5. Règles de jeu

### 5.1 Calcul des points

- **Mode coopératif / famille (`useFamilyGame.js`)** : **100 points** par bonne réponse.
- **Bonus de vitesse** : `round(max(0, (temps_limite − temps_pris) / temps_limite) × 50)`, soit **jusqu'à 50 points** par question.
- Le score affiché dans l'en-tête est `score + speedBonus`. Les résultats sont enregistrés à la fin de la partie (`useGameCompletion`, mode `family-game`).

### 5.2 Expérience (XP)

- L'XP est attribuée côté serveur par la fonction `increment_xp`.
- Limites : **30 attributions par heure** par joueur, **500 XP maximum** par attribution.

### 5.3 Arbre de talents

- Le nœud `root` (**NEXUS**) est débloqué par défaut. Il n'a pas de prérequis.
- Un nœud se débloque si **tous** ses prérequis (`req`) sont débloqués et si le joueur a assez d'XP.
- Le déblocage passe par la fonction `unlock_skill_secure(p_skill_id)` côté serveur. Le client ne peut pas s'accorder un talent.
- La branche `cars` (CLAN DES PILOTES) comporte : DRIFT (25 XP, requis : root), NITRO (50 XP, requis : DRIFT), GRIP (75 XP, requis : NITRO), MULTIVERS (180 XP, requis : GRIP).
- Les nœuds `boss_hero` et `boss_primitive` sont marqués `ultimate: true`.
- Les définitions sont dans `supabase/migrations/20261030134040_seed_skill_definitions.sql` (47 entrées), générées par `scripts/generate-skill-definitions-seed.js`.

### 5.4 Quêtes

- Une quête a un `nodeReq` : le nœud de l'arbre qui doit être débloqué pour la rendre accessible. `null` signifie accessible d'emblée.
- Quêtes actuelles : q1 à q13 (hors q9), plus q9 « Épreuve Légendaire : La Collision », marquée `ultimate`.
- Validation : `complete_quest_secure`. Le test `quests.test.js` échoue si une quête pointe vers un nœud inexistant ou s'il existe moins de deux quêtes ultimes.

### 5.5 Mode bluff (`BluffRoyal.jsx`)

- Source des questions : les questions **validées** (`ai_questions`, `status = approved`, `type = bluff`) du thème choisi, complétées par les questions **locales** si nécessaire.
- L'en-tête indique la source utilisée : « questions validées », « questions validées + locales » ou « questions locales ».
- Le thème `general` (ou tout thème inconnu) ne filtre pas par thème.
- La configuration vient de `location.state.config` (configurateur solo) ou de `state.players` / `state.theme` (salon multijoueur).

### 5.6 Salon multijoueur

- L'hôte crée un salon (`/quiz/host`), les joueurs le rejoignent (`/quiz/join`).
- L'état de partie est partagé en temps réel. Les règles de visibilité des salons sont gérées par les migrations `game_rooms` (voir section 9).

---

## 6. Assistant RAG et modes d'intervention

### 6.1 Principe

L'assistant ne « apprend » pas. Il **recherche** dans les questions approuvées de la table `ai_questions` (lignes `type = 'knowledge'` pour les connaissances sur l'application), par recherche plein texte PostgreSQL en français :

- index : `to_tsvector('french', question || ' ' || explanation)` ;
- requête : `websearch_to_tsquery('french', …)` ;
- classement : `ts_rank`.

Conséquence importante : la **réponse** doit être recopiée dans `explanation`, sinon elle n'est pas retrouvée. C'est ce que fait le seed `20261101000100_app_knowledge_seed.sql` (14 lignes approuvées).

### 6.2 Modes (`app_settings.assistant_mode`)

| Mode | Comportement |
|---|---|
| `off` | Aucune réponse. Mode par défaut, et mode de repli en cas d'erreur (fail-closed). |
| `supervised` | Si aucune connaissance approuvée ne correspond, une **proposition** est créée (`status = pending`) et placée dans la file de revue de l'administrateur. Rien n'est affiché au joueur tant que l'administrateur n'a pas approuvé. |
| `auto` | Répond uniquement à partir des connaissances approuvées. Aucune invention, aucun appel au modèle (économie). |

Le mode est lu dans `app_settings` à chaque requête. S'il ne peut pas être lu, le mode est `off`.

### 6.3 Contrôles de la fonction `assistant`

- **Authentification obligatoire** (JWT Supabase) pour tous les modes.
- **Limitation de débit** : `RATE_LIMIT_MAX = 10` appels, appliqués par la RPC `assistant_hit` (table `assistant_rate`). La version de développement dispose d'un repli en mémoire.
- **Longueur maximale** : 500 caractères par message.
- **CORS** : origine autorisée via `ALLOWED_ORIGIN` (voir section 15 pour le point de vigilance).

### 6.4 Activer l'assistant

1. Appliquer toutes les migrations (`20261020000001`, `20261020000002`, `20261024000000`, `20261101000100`).
2. Vérifier que les 14 connaissances sont approuvées (`status = approved`, `type = knowledge`).
3. Définir le mode voulu dans l'interface admin (section 7) ou via `app_settings`.
4. Tester avec une question présente dans le seed et une question absente.

---

## 7. Administration

### 7.1 Revue des questions (`/quiz/admin/questions`, `AdminQuestionsReview.jsx`)

- Liste les questions `status = pending` générées par IA ou proposées par le mode `supervised`.
- Actions : approuver, rejeter, modifier avant approbation.
- Seules les questions `approved` sont utilisées par les jeux et l'assistant.

### 7.2 Mode de l'assistant (`AssistantModeControl.jsx`)

- Sélecteur `off` / `supervised` / `auto`.
- La mise à jour écrit dans `app_settings` et vérifie l'erreur retournée. Il n'y a qu'une seule insertion, suivie d'une mise à jour.

### 7.3 Génération de questions et de quiz

- `generate-questions` : crée des questions (type `mcq`, `bluff` ou `knowledge`) avec `status = pending`.
- `generate-quiz` : crée un ensemble de questions pour un quiz.
- Les deux fonctions exigent `profiles.role = 'admin'` et utilisent Gemini. La clé est transmise dans l'en-tête `x-goog-api-key`.
- Rien n'est publié sans passer par la revue (section 7.1).

### 7.4 Ajouter un administrateur

Une seule méthode, en SQL, par une personne qui a accès à la base :

```sql
update public.profiles set role = 'admin' where id = '<uuid_utilisateur>';
```

Retirer le rôle : remplacer `'admin'` par `'player'` (ou la valeur par défaut du schéma, à vérifier dans `init_schema`).

---

## 8. Architecture technique

### 8.1 Vue d'ensemble

```
Navigateur (React 18 + Vite, PWA)
   │  supabase-js (clé publique + JWT utilisateur)
   ├── Postgres / RLS / RPC SECURITY DEFINER
   ├── Realtime (postgres_changes, canal activity_feed)
   └── Fonctions Edge (Deno)
         ├── assistant
         ├── generate-questions  ──► Gemini
         └── generate-quiz       ──► Gemini
```

### 8.2 Front-end

- Point d'entrée : `src/main.jsx` → `src/pages/App.jsx`.
- Routage : `react-router-dom`.
- Chargement différé : `src/routes/lazyComponents.js`.
- Animations : `framer-motion` ; icônes : `iconify-icon` ; 3D : `three` / `@react-three/fiber` / `@react-three/drei`.
- Contexte de thème : `src/context/ThemeContext.jsx`.
- Hooks principaux : `usePlayerData` (profil, XP, talents, quêtes), `useGameCompletion` (fin de partie), `useFamilyGame`, `useChat`, `useNotifications`, `useSoundFX`.
- Validation : `zod` (`src/schemas/index.js`).

### 8.3 Synchronisation de la progression

1. Une action réussie (partie, quête, talent) appelle `emitProgressChanged()`.
2. `usePlayerData` écoute `wakkany:progress-changed` et relit depuis le serveur : `profiles.xp`, `unlocked_skills`, `completed_quests`.
3. L'interface se met à jour sans rechargement.

### 8.4 Flux d'activité

- `publishActivity` écrit dans `activity_events` (l'utilisateur ne peut écrire que sous son propre `user_id`).
- `subscribeActivity` écoute les insertions via Realtime (canal `activity_feed`).
- Affiché dans `ActivityList.jsx` (tableau de bord) et `DashboardNav.jsx` (visible à partir de md).

### 8.5 PWA

Configurée dans `vite.config.js` (`vite-plugin-pwa`, Workbox `generateSW`) :

- `registerType: 'autoUpdate'`, `skipWaiting` et `clientsClaim` activés : une nouvelle version est appliquée au rechargement.
- Précache : fichiers `js`, `css`, `html`, images, polices et audio du build. Les fichiers de `public/` ne sont **pas** ajoutés via `includeAssets` (cela créait des doublons de précache).
- Stratégies d'exécution :
  - documents : `NetworkFirst` (délai 4 s, repli sur le cache) ;
  - scripts et styles : `StaleWhileRevalidate` ;
  - images, polices, icônes Iconify, audio : `CacheFirst` avec expiration.
- Manifeste : nom « Wakkany », `display: standalone`, icônes `icon-192.png` et `icon-512.png` (purpose `any`).
- Vérifié : 75 entrées précachées, rechargement hors ligne fonctionnel.

### 8.6 Accessibilité et animations

- `src/index.css` contient une règle globale `prefers-reduced-motion` qui réduit les animations.
- Les animations SVG utilisent `transform-box: fill-box` et `transform-origin: center` (règle `svg [class*="animate-"]`), pour que la rotation se fasse autour du centre de l'élément.
- L'aura d'éclair de l'avatar (`Avatar.jsx`) : deux anneaux (r = 94 et r = 86) et des éclairs symétriques (classe `animate-bolt`, keyframes `bolt-flicker`).

### 8.7 Responsive

- Points de rupture Tailwind jusqu'à `xl`, plus `2xl` et `min-[2400px]` ajoutés pour les grands écrans (bouton START du preloader).
- Le preloader s'adapte au portrait (`max-aspect-ratio: 4/5`) : image entière en `contain` sur un fond flouté.
- **Vérifié** : preloader (téléphone, grand écran).
- **Non vérifié** : pages de jeu et tableau de bord sur téléviseurs et tablettes. Voir section 15.

---

## 9. Modèle de données et migrations

### 9.1 Tables principales

| Table | Rôle | Accès |
|---|---|---|
| `profiles` | Pseudo, avatar, XP, rôle, clan | Lecture selon RLS ; modification via `secure_profile_updates`. |
| `skill_definitions` | Catalogue des talents (47 entrées) | Lecture publique ; écrit par seed. |
| `unlocked_skills` | Talents débloqués par joueur | Écrit uniquement via `unlock_skill_secure`. |
| `completed_quests` | Quêtes validées | Écrit via `complete_quest_secure`. |
| `ai_questions` | Questions (mcq, bluff, knowledge) avec `status` (pending, approved, rejected) | Lecture des approuvées ; écriture admin ; insertion `pending` par les fonctions IA. |
| `app_settings` | Paramètres globaux, dont `assistant_mode` | Lecture ; écriture admin. |
| `assistant_rate` | Compteur de débit de l'assistant | Via RPC `assistant_hit`. |
| `xp_grants` | Historique des attributions d'XP (limites) | Via RPC `increment_xp`. |
| `activity_events` | Flux d'activité | Lecture authentifiée ; insertion uniquement pour soi-même ; publié en Realtime. |
| `game_rooms`, `game_sessions` | Salons et suivi des parties | RLS corrigée par les migrations `20261026000001` ; voir section 15. |
| `chat`, `notifications` | Messagerie et notifications | Migration `20260620000000`. |

### 9.2 Fonctions SQL importantes

| Fonction | Rôle |
|---|---|
| `increment_xp` | Ajoute de l'XP en respectant les limites (30/heure, 500 max). |
| `unlock_skill_secure(p_skill_id TEXT)` | Débloque un talent si les prérequis et l'XP sont présents. Exempte `root`. |
| `complete_quest_secure` | Valide une quête (deux surcharges). |
| `assistant_hit(p_limit)` | Compte les appels de l'assistant et renvoie `true` si la limite n'est pas atteinte. |
| `match_approved_questions` | Recherche plein texte dans les questions approuvées. |

Toutes les fonctions `SECURITY DEFINER` déclarent `SET search_path = public, pg_temp`.

### 9.3 Ordre des migrations

Les migrations s'appliquent **dans l'ordre alphabétique des noms de fichiers** (horodatage en tête). Liste complète :

1. `20260509000000_init_schema.sql`
2. `20260510000000_rls_policies.sql`
3. `20260618000000_secure_profile_updates.sql`
4. `20260619215152_seed_skill_definitions.sql`
5. `20260620000000_chat_and_notifications.sql`
6. `20260721000000_ai_generated_questions.sql`
7. `20260722000000_ai_questions.sql`
8. `20260723000000_game_rooms.sql`
9. `20260724000000_fix_game_rooms_rls.sql`
10. `20260729000000_secure_quests_and_skills.sql`
11. `20260802000000_game_sessions_tracking.sql`
12. `20261020000001_rag_match_function.sql`
13. `20261020000002_rag_settings_and_pending.sql`
14. `20261024000000_audit_fixes.sql`
15. `20261026000001_fix_game_rooms_and_sessions_rls.sql`
16. `20261026000002_secure_xp_and_quests.sql`
17. `20261026000003_allow_knowledge_type.sql`
18. `20261030134040_seed_skill_definitions.sql`
19. `20261101000000_activity_events.sql`
20. `20261101000100_app_knowledge_seed.sql`
21. `20261101000200_unlock_root_prerequisite.sql`

**Règle** : ne jamais modifier une migration déjà appliquée. Pour corriger, créer une nouvelle migration avec un horodatage postérieur. La migration `20261101000200` en est un exemple : elle rétablit l'exemption de `root` supprimée par `20261026000002`.

### 9.4 Données générées

Deux scripts régénèrent des migrations de seed. Ne pas les éditer à la main :

| Script | Sortie |
|---|---|
| `scripts/generate-skill-definitions-seed.js` | `supabase/migrations/<horodatage>_seed_skill_definitions.sql` (upsert) |
| `scripts/generate-app-knowledge-seed.js` | `supabase/migrations/20261101000100_app_knowledge_seed.sql` (idempotent, `WHERE NOT EXISTS`) |

Après modification de `src/data/branches.js`, relancer le script de seed des talents puis créer une migration.

---

## 10. Fonctions Edge

| Fonction | Entrée principale | Sécurité | Variables requises |
|---|---|---|---|
| `assistant` | `{ prompt, mode?, context? }`, `mode` ∈ `chat`, `generate_question`, `generate_scenario` | JWT obligatoire, débit limité, mode lu dans `app_settings` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGIN`, `GEMINI_API_KEY` |
| `generate-questions` | Demande de génération | Rôle `admin` vérifié | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` |
| `generate-quiz` | Demande de quiz | Rôle `admin` vérifié | Idem |

Notes :

- Une ancienne mention de `OPENAI_API_KEY` subsiste dans un commentaire de `generate-questions`. Le code n'utilise que Gemini ; cette mention peut être supprimée.
- Les clés doivent être définies dans les secrets Supabase (`supabase secrets set …`), jamais dans le dépôt.

Déploiement d'une fonction :

```bash
supabase functions deploy assistant
supabase functions deploy generate-questions
supabase functions deploy generate-quiz
```

---

## 11. Configuration et variables d'environnement

### 11.1 Front-end (`.env`, préfixe `VITE_`)

| Variable | Obligatoire | Rôle |
|---|---|---|
| `VITE_SUPABASE_URL` | Oui | URL du projet Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Oui | Clé publique (anon / publishable). Pas de clé secrète ici. |
| `VITE_SUPABASE_UNAVAILABLE_MESSAGE` | Non | Message affiché si Supabase n'est pas configuré. |
| `VITE_SENTRY_DSN` | Non | Suivi d'erreurs. |
| `VITE_BASE_PATH` | Non | Chemin de base (défaut `/`). Utile pour GitHub Pages. |

Sans `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, l'application démarre en mode dégradé : le multijoueur est indisponible et le message `VITE_SUPABASE_UNAVAILABLE_MESSAGE` est affiché.

### 11.2 Autres

| Variable | Où | Rôle |
|---|---|---|
| `PORT` | Conteneur / serveur | Port d'écoute (défaut 5173 en local). |
| `NODE_ENV` | Build | `development` ou `production`. |

Les `.env` réels sont ignorés par Git (`.gitignore`). Le modèle est `.env.example`.

---

## 12. Installation locale et commandes

### 12.1 Démarrage

```bash
git clone https://github.com/Ourajeenn/plateforme-gamefication_wakkany.git
cd plateforme-gamefication_wakkany
git checkout dev
cp .env.example .env        # puis renseigner les valeurs Supabase
npm install
npm run dev
```

Le serveur de développement écoute sur le port 5179 (`vite.config.js`).

### 12.2 Scripts (`package.json`)

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement. |
| `npm run build` | Build de production dans `dist/`. |
| `npm run preview` | Prévisualisation du build. |
| `npm run lint` | ESLint sur `src/`. |
| `npm test` | Tests Vitest. |
| `npm run security:scan` | Recherche de secrets (`scripts/scan-secrets.js`). |
| `npm run security:audit` | `npm audit` (niveau modéré). |
| `npm run semgrep` | Analyse statique (`.semgrep.yml`). |
| `npm run deploy` | Publication sur GitHub Pages (`gh-pages`). |

### 12.3 Base de données en local

Utiliser le CLI Supabase, puis appliquer les migrations dans l'ordre (section 9.3). Vérifier chaque migration sur PostgreSQL 16 avant de l'appliquer en production.

---

## 13. Tests, qualité et sécurité

### 13.1 Tests

- Commande : `npm test` (Vitest, environnement jsdom, configuration dans `tests/setupTests.js`).
- Tests présents : `tests/App.test.jsx`, `tests/App.routing.test.jsx`, `src/data/quests.test.js`, `src/utils/security.test.js`, `src/utils/auth.test.js`, `src/utils/isSupabaseConfigured.test.js`, `src/utils/llmQuestionGenerator.test.js`, `src/utils/xpSync.integration.test.js`, `src/utils/assistantRAG.test.js`, `src/hooks/useNotifications.test.js`, `src/hooks/useChat.test.js`.
- Dernier état connu : **43 tests au vert** après la dernière fusion.

### 13.2 Lint

- `npm run lint` remonte **36 erreurs** `react/no-unescaped-entities` dans `LandingPage.jsx`. Elles existaient avant les corrections et ne sont pas bloquantes pour la CI à ce jour, mais elles sont à corriger (apostrophes et guillemets à échapper).

### 13.3 Sécurité (synthèse)

- **Clés** : seule la clé publique est dans le front. Les clés IA et la clé `service_role` sont dans les secrets des fonctions Edge.
- **RLS** : activée sur les tables sensibles. Les écritures de progression passent par des RPC `SECURITY DEFINER`.
- **En-têtes HTTP** : CSP sans `unsafe-inline` dans `script-src` (`vercel.json` et `nginx.conf`), `X-Frame-Options: DENY`, HSTS, `object-src 'none'`, `base-uri 'self'`.
- **Authentification de l'assistant** : obligatoire pour tous les modes.
- **Analyse** : Trivy (fichiers et image Docker), Semgrep, scan de secrets, `npm audit`.
- Documents de référence : `docs/AUDIT_SECURITY.md`, `docs/SECURITY_ACTION_PLAN.md`, `docs/SECURITY_BEST_PRACTICES.md`.

---

## 14. Déploiement et CI/CD

### 14.1 Workflow (`.github/workflows/ci-cd.yml`)

Déclenché sur les pushes vers `main`, `dev`, `features/**`, sur les pull requests et manuellement.

| Job | Rôle | Condition |
|---|---|---|
| `lint` | ESLint | Toujours |
| `secret_scan` | Recherche de secrets | Toujours |
| `npm_audit` | Audit des dépendances | Toujours |
| `fs_security_scan` | Trivy sur le système de fichiers | Toujours |
| `test` | Vitest | Toujours |
| `build` | Build Vercel et build GitHub Pages (artefact `dist-build`) | Toujours |
| `docker_scan` | Build de l'image Docker et scan Trivy | Toujours |
| `semgrep_scan` | Semgrep | Toujours |
| `deploy_github_pages` | Déploiement GitHub Pages | Branche `main`, hors pull request |
| `verify_github_pages` | Vérification après 30 s | Branche `main` |
| `deploy_vercel` | Déploiement Vercel | Hors pull request, si `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` sont présents ; sinon ignoré |

### 14.2 Plateformes

- **Netlify** : déploie directement depuis le dépôt GitHub. Le site de production est `wakk.netlify.app` (ou l'adresse configurée). **Point à confirmer** : la branche suivie par Netlify. Le déploiement se fait en poussant sur cette branche ; l'hypothèse de travail est `dev`, à vérifier dans le tableau de bord Netlify.
- **Vercel** : déploiement par le job `deploy_vercel` si les secrets sont configurés.
- **GitHub Pages** : uniquement depuis `main`, avec `VITE_BASE_PATH` adapté.
- **Docker** : `Dockerfile` multi-étapes : `node:24-alpine` pour le build, `nginx:1.27-alpine` pour servir `dist/` avec `nginx.conf`, port 80, contrôle de santé `curl`. Aucune configuration Fly.io ne subsiste.

### 14.3 Procédure de publication standard

1. Créer une branche `features/<sujet>` depuis `dev`.
2. Commit, puis push. La CI s'exécute.
3. Vérifier que `lint`, `test`, `build` et les scans passent.
4. Fusionner dans `dev`. Le déploiement Netlify et Vercel suit la branche configurée.
5. Pour la production : fusionner `dev` dans `main`.
6. Si la version contient une migration : **appliquer la migration en base de production avant** de déployer le front qui en dépend.

---

## 15. Limites connues et points ouverts

| # | Sujet | État | Action suggérée |
|---|---|---|---|
| 1 | **Internationalisation** | Non implémentée. Interface uniquement en français. Le sélecteur « FR » non fonctionnel a été retiré du pied de page. | Introduire un système de traduction (ex. `react-i18next`) puis extraire les chaînes. |
| 2 | **Responsive complet** | Preloader vérifié. Pages de jeu, tableau de bord et écrans TV/tablette non vérifiés. Points de rupture s'arrêtent à `xl`. | Passer chaque écran à 390 px, 768 px, 1280 px, 1920 px et 3840 px. |
| 3 | **Identifiant de clan `dinos` vs branche `primitives`** | Le clan « Ère Primaire » porte l'identifiant `dinos`, alors que l'arbre de talents utilise `primitives`. Les quêtes utilisent aussi `dinos`. | Unifier les identifiants dans `branches.js`, `quests.js`, `ProfileSetup.jsx` et les migrations. |
| 4 | **CORS de l'assistant** | La version de développement accepte par défaut les origines `localhost`, `*.vercel.app` et `*.github.io` lorsque `ALLOWED_ORIGIN` n'est pas défini. | Définir `ALLOWED_ORIGIN` en production et restreindre le repli. |
| 5 | **Migrations en production** | Les migrations `20261024000000` à `20261101000200` doivent être appliquées manuellement sur le projet Supabase de production. | Vérifier l'état avec la table de suivi des migrations avant chaque publication. |
| 6 | **Netlify** | Branche de déploiement non confirmée dans le tableau de bord. | Confirmer et consigner la branche dans ce document. |
| 7 | **RLS des salons (`game_rooms`)** | Décision de politique d'accès en attente (point C3 de l'audit). | Trancher entre salon public et salon restreint à l'hôte. |
| 8 | **Vulnérabilités `vitest`** | Des vulnérabilités critiques signalées par `npm audit` concernent la chaîne de test. | Mettre à jour `vitest` et ses dépendances (test uniquement, pas le bundle de production). |
| 9 | **Lint `LandingPage.jsx`** | 36 erreurs `react/no-unescaped-entities`, pré-existantes. | Échapper les caractères ou corriger les chaînes. |
| 10 | **Commentaire `OPENAI_API_KEY`** | Mention obsolète dans `generate-questions`. | Supprimer le commentaire. |
| 11 | **Avatars** | Animations partiellement harmonisées (aura et ping). | Continuer la passe d'animation et vérifier sur appareil réel. |

---

## 16. Procédures de maintenance

### 16.1 Ajouter une question validée

1. Connecté en administrateur, ouvrir `/quiz/admin/questions`.
2. Vérifier la question, corriger si besoin, approuver.
3. Vérifier qu'elle apparaît dans le mode bluff ou le quiz selon son `type`.

### 16.2 Ajouter une connaissance pour l'assistant

1. Rédiger la question (formulation courante du joueur) et la réponse **dans `explanation`**.
2. Ajouter la ligne via une nouvelle migration (ou le script `scripts/generate-app-knowledge-seed.js`), avec `type = 'knowledge'` et `status = 'approved'`.
3. Tester la recherche : la question doit remonter en tête des résultats.

### 16.3 Modifier l'arbre de talents

1. Modifier `src/data/branches.js` (identifiants uniques, prérequis existants, `xp` et `tier` cohérents).
2. Mettre à jour `src/data/quests.js` si un `nodeReq` change.
3. Lancer `npm test` : le test de cohérence `quests.test.js` doit passer.
4. Régénérer le seed des talents, créer la migration correspondante, l'appliquer.

### 16.4 Ajouter une quête

1. Ajouter l'objet dans `src/data/quests.js` avec `id` unique, `branch`, `nodeReq` existant (ou `null`).
2. Lancer `npm test`.
3. Si la quête doit être persistée, vérifier `complete_quest_secure`.

### 16.5 Changer le mode de l'assistant

- Via l'interface admin (`AssistantModeControl`). Repasser en `off` en cas de comportement anormal : c'est le réglage sûr.

### 16.6 Renouveler une clé API Gemini

1. Générer une nouvelle clé dans Google AI Studio.
2. Mettre à jour le secret `GEMINI_API_KEY` dans Supabase.
3. Redéployer les fonctions IA si nécessaire.
4. Révoquer l'ancienne clé.

### 16.7 Mise à jour des dépendances

```bash
npm outdated
npm audit --audit-level=moderate
npm test && npm run build
```

Tester le build et le PWA (rechargement hors ligne) avant de fusionner.

### 16.8 Vérifier la PWA après une publication

1. Ouvrir le site, puis recharger une fois : la nouvelle version doit être servie (`autoUpdate`).
2. Couper le réseau, recharger : la page doit s'afficher depuis le cache.
3. Vérifier que le manifeste est lisible (icônes, nom, `display: standalone`).

### 16.9 Surveillance

- Erreurs front : Sentry si `VITE_SENTRY_DSN` est défini.
- Erreurs serveur : journaux des fonctions Edge dans le tableau de bord Supabase.
- Débit de l'assistant : table `assistant_rate`.

---

## 17. Dépannage

| Symptôme | Cause probable | Action |
|---|---|---|
| Message « Multijoueur indisponible » | Variables Supabase absentes ou erronées au build | Vérifier `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis reconstruire. |
| L'assistant ne répond pas | Mode `off`, ou aucune connaissance approuvée | Vérifier `app_settings.assistant_mode` et les lignes `type = 'knowledge'`. |
| L'assistant répond « je ne sais pas » en mode `auto` | Question absente du seed | Ajouter une connaissance (section 16.2). |
| Le mode bluff affiche toujours les mêmes questions | Thème sans questions validées ou configuration non transmise | Lire l'indication de source dans l'en-tête ; vérifier les questions approuvées du thème. |
| Une quête reste verrouillée | `nodeReq` pointe vers un nœud non débloqué | Vérifier `unlocked_skills` et `quests.js`. |
| Talents non mis à jour après une partie | Événement de progression non émis | Vérifier `emitProgressChanged` dans `useGameCompletion` ; recharger. |
| Flux d'activité vide | Migration `activity_events` non appliquée, ou Realtime désactivé pour la table | Appliquer la migration ; vérifier la publication Realtime. |
| Modification du site non visible sur `wakk.netlify.app` | Push effectué sur une autre branche que celle suivie par Netlify | Vérifier la branche configurée dans Netlify. |
| Cache PWA ancien | Service worker non mis à jour | Recharger deux fois ; en dernier recours, vider les données du site. |
| Erreur « unlock_skill_secure » à l'exécution (talent racine refusé) | Migration `20261101000200` non appliquée | Appliquer la migration. |
| Build Docker échoue | Dockerfile ou dépendances | Vérifier l'étape `node:24-alpine` et `npm ci`. |

---

*Document rédigé à partir de l'état du dépôt sur `dev`. À mettre à jour à chaque modification de l'architecture, des migrations ou des processus de déploiement.*
