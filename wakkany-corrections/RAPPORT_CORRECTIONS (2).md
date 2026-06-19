# Wakkany — Rapport de corrections (Sécurité, Architecture, Déploiement)

Ce document accompagne les fichiers du dossier `wakkany-corrections/`. Chaque
fichier `*.fixed.*` est une version corrigée d'un fichier existant — à
copier-coller à l'emplacement d'origine après relecture.

---

## 1. Sécurité — Anti-triche XP & élévation de privilèges (URGENT)

### Le problème
La policy RLS sur `profiles` :
```sql
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```
autorise un utilisateur connecté à modifier **toutes les colonnes** de sa
propre ligne via l'API REST Supabase — pas seulement via l'app React, mais
via n'importe quel client HTTP (curl, Postman, devtools réseau...). Or
`profiles` contient :
- `xp` / `level` → falsifiables → triche sur le leaderboard
- `role` (`admin`/`user`) → **élévation de privilèges** si ce champ est un
  jour utilisé pour des contrôles d'accès admin

Le code applicatif (`useSupabasePlayerData.js`, `storageHelpers.js`)
aggrave le problème car il fait lui-même un `update({ xp: newXp })` /
`upsert({ xp, ... })` avec une valeur **calculée côté navigateur**, sans
aucune validation serveur.

### La correction
Fichier : `supabase/migrations/20260618000000_secure_profile_updates.sql`

1. **Trigger BEFORE UPDATE** sur `profiles` qui rejette toute tentative de
   changer `role`, `xp` ou `level` par la voie REST classique.
2. **Fonction RPC `increment_xp(amount)`** (`SECURITY DEFINER`) : le client
   envoie un *delta* ("+50 xp"), jamais une valeur absolue. Le serveur
   plafonne chaque gain à 500 XP pour limiter l'impact d'un bug ou d'un
   abus applicatif (spam de quiz, etc.).
3. **Table `skill_definitions`** + **fonction RPC `unlock_skill_secure`** :
   revalide côté serveur le coût XP et les prérequis d'une compétence avant
   de l'insérer dans `unlocked_skills`, au lieu de faire confiance à la
   vérification React (`checkAvailable` dans `SkillTree.jsx`), qui reste
   utile pour l'UX mais n'est plus la seule barrière.

### Fichiers client à mettre à jour en miroir
- `src-hooks-corriges/useSupabasePlayerData.fixed.js` → remplace
  `update({xp: newXp})` par `supabase.rpc('increment_xp', {amount})` et
  l'insert direct dans `unlocked_skills` par
  `supabase.rpc('unlock_skill_secure', {p_skill_id})`.
- **Script à lancer une fois** : `scripts/generate-skill-definitions-seed.js`
  génère automatiquement les `INSERT` SQL pour `skill_definitions` à partir
  de `src/data/branches.js` (43 compétences détectées sur votre arbre
  actuel). À relancer chaque fois que vous modifiez `branches.js`.

  ```bash
  node scripts/generate-skill-definitions-seed.js
  # puis appliquer la migration générée dans supabase/migrations/
  ```

### ⚠️ Point à valider avec vous
Tous les appelants de `updateXp()` dans le code actuel lui passent
aujourd'hui un **total absolu**. Avec la version corrigée, il faut leur
passer un **delta**. Je n'ai pas modifié `App.jsx` / les composants
consommateurs car je ne voulais pas réécrire la logique de gain d'XP sans
votre validation — dites-moi si vous voulez que je fasse cette passe.

---

## 2. Bug fonctionnel majeur — Le classement global ne fonctionnait pas en production

### Le problème
`useLeaderboard.js` lit/écrit via `window.storage` — une API qui n'existe
**que dans l'environnement "artifact" de Claude.ai**. Dans une vraie build
Vite déployée (Vercel, GitHub Pages, Docker/nginx), `window.storage` est
`undefined`. Le code retombait silencieusement sur `localStorage`, qui est
strictement local au navigateur de chaque joueur.

**Conséquence concrète : chaque joueur ne voyait que lui-même (+ les 3
faux joueurs mock) dans le classement.** Ce n'était pas un bug visible
immédiatement (pas d'erreur, pas de crash) — juste une fonctionnalité
silencieusement cassée.

### La correction
Fichier : `src-hooks-corriges/useLeaderboard.fixed.js`

Utilise directement la table `profiles` (déjà lisible par tous via la
policy `"Public profiles are viewable by everyone"`), avec :
- tri par XP décroissant, limite configurable (100 par défaut)
- abonnement Realtime Supabase pour les mises à jour en direct
- fallback sur les 3 joueurs de démo uniquement si Supabase n'est pas
  configuré (mode dev local sans backend)
- la fonction `syncMyScore` a été supprimée : l'écriture du score se fait
  désormais uniquement via `increment_xp` au moment où l'XP est gagnée,
  jamais depuis le composant d'affichage du classement.

---

## 3. Revue ciblée — SkillTree / Auth (point 2 de votre demande)

### Authentification (`useAuth.js`, `utils/auth.js`, `AuthForm.jsx`)
Implémentation saine, rien à corriger :
- délègue entièrement à `supabase.auth` (pas de gestion JWT manuelle)
- `minLength={8}` sur le mot de passe côté formulaire (à doubler d'une
  policy de mot de passe côté Supabase Dashboard si pas déjà fait :
  Authentication → Policies)
- pas de stockage de credentials en clair

### SkillTree (`SkillTree.jsx`)
La logique `checkAvailable()` (XP suffisant + prérequis remplis) est
correcte **comme garde-fou UI**, mais comme `xp` et `unlockedSkills`
viennent de l'état React alimenté par Supabase, elle ne protégeait contre
rien côté serveur avant la correction de la section 1. C'est maintenant
couvert par `unlock_skill_secure`.

Point mineur non bloquant : `jokers` (système d'aide familial) est stocké
en `localStorage` brut (`wakkany_jokers`), donc personnel à l'appareil —
cohérent avec un usage "un compte = un enfant sur son propre appareil",
mais à signaler si vous envisagez qu'un même compte soit utilisé sur
plusieurs appareils (la valeur ne suivrait pas).

---

## 4. Pipeline de déploiement

### Bug bloquant — Dockerfile
```dockerfile
RUN npm ci --only=production && npm run build
```
`vite`, `@vitejs/plugin-react`, `tailwindcss`, etc. sont dans
`devDependencies`. Avec `--only=production`, ils ne sont pas installés et
`npm run build` échoue. **J'ai vérifié en conditions réelles** : `npm ci`
(sans le flag) + `npm run build` fonctionnent et produisent un `dist/` de
39 Mo sans erreur.

Fichier corrigé : `Dockerfile.fixed`
- Stage 1 (build) : `npm ci` complet, build, puis seul `dist/` est copié
  dans le Stage 2 → les `devDependencies` ne finissent jamais dans l'image
  finale (toujours minimale).
- Ajout de `tini` et `curl` via `apk add` (absents par défaut de
  `nginx:alpine`, nécessaires respectivement à l'`ENTRYPOINT` et au
  `HEALTHCHECK` déjà présents dans votre fichier original).
- Suppression du `USER nginx` placé avant le `CMD` : nginx doit démarrer
  root pour créer `/var/run/nginx.pid` et bind le port 80, puis il droppe
  lui-même ses privilèges pour les workers (comportement par défaut de
  l'image officielle). Le garder cassait le démarrage du conteneur.

### Bug bloquant — Workflows GitHub Actions
`deploy-vercel.yml` déclarait :
```yaml
needs: [test, build]
```
en référençant des jobs définis dans **un autre fichier**
(`deploy-github-pages.yml`). GitHub Actions ne supporte pas les
dépendances `needs` entre workflows différents : ce job échouait
systématiquement. De plus, il tentait de télécharger un artefact nommé
`artifact` qui n'était jamais uploadé sous ce nom (l'autre workflow utilise
`upload-pages-artifact`, un mécanisme distinct d'`upload-artifact` /
`download-artifact`).

J'ai fusionné les trois fichiers existants (`security.yml`,
`deploy-github-pages.yml`, `deploy-vercel.yml`) en un seul :
**`.github/workflows/ci-cd.yml`**, avec une chaîne de jobs explicite :

```
lint → secret_scan ─┐
                     ├→ test → build → docker_scan → deploy_github_pages → verify_github_pages
       npm_audit ────┤                            └→ deploy_vercel
   fs_security_scan ─┘
```

Changements notables :
- Un seul artefact de build (`dist-build`) partagé par les deux
  déploiements, plus l'artefact Pages dédié.
- `npm audit --audit-level=high` sans le `|| true` qui annulait
  silencieusement les échecs dans votre script `security:audit` original.
- Déploiements (`deploy_github_pages`, `deploy_vercel`) conditionnés à
  `github.ref == 'refs/heads/main'` et exclus des Pull Requests — avant,
  rien n'empêchait un déploiement en prod depuis une simple branche
  `features/**` ou une PR.
- Correction de la commande Vercel : `vercel --confirm` n'existe plus dans
  les versions récentes du CLI → remplacée par
  `vercel deploy ./dist --prebuilt --prod`. Récupération de l'URL de
  déploiement directement depuis la sortie de la commande plutôt que via
  un `grep`/`awk` fragile sur `vercel ls`.
- Injection de `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (secrets
  GitHub) au moment du build — sans ça, votre build CI utilisait les
  placeholders et l'app tournait en mode "Supabase non configuré" même en
  prod.

**Action à faire de votre côté** : supprimer les anciens
`.github/workflows/security.yml`, `deploy-github-pages.yml` et
`deploy-vercel.yml` une fois `ci-cd.yml` en place, pour éviter d'avoir deux
pipelines qui tournent en parallèle. Je ne les ai pas supprimés
automatiquement — à vous de valider.

**Secrets GitHub à vérifier/ajouter** (Settings → Secrets and variables →
Actions) : `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`,
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### `.gitlab-ci.yml`
Non corrigé pour l'instant — dites-moi si vous déployez réellement via
GitLab CI en parallèle de GitHub Actions, ou si ce fichier est un résidu
d'une migration GitHub → GitLab (ou l'inverse) qui peut être supprimé.

---

## Récapitulatif des fichiers livrés

| Fichier | Remplace | Action |
|---|---|---|
| `supabase/migrations/20260618000000_secure_profile_updates.sql` | — (nouvelle migration) | Appliquer via `supabase db push` ou le SQL Editor |
| `scripts/generate-skill-definitions-seed.js` | — (nouveau script) | Lancer une fois, puis appliquer la migration générée |
| `src-hooks-corriges/useSupabasePlayerData.fixed.js` | `src/hooks/useSupabasePlayerData.js` | Remplacer après relecture (changement de signature `updateXp`) |
| `src-hooks-corriges/useLeaderboard.fixed.js` | `src/hooks/useLeaderboard.js` | Remplacer après relecture |
| `Dockerfile.fixed` | `Dockerfile` | Remplacer |
| `.github/workflows/ci-cd.yml` | `security.yml` + `deploy-github-pages.yml` + `deploy-vercel.yml` | Ajouter, puis supprimer les 3 anciens fichiers |

## Ce qui n'a pas été touché (volontairement)
- `nginx.conf` / `vercel.json` : déjà corrects (CSP raisonnable, HSTS,
  headers de sécurité présents).
- `AUDIT_SECURITY.md` existant : toujours pertinent pour ses autres points
  (mises à jour de dépendances, monitoring/Sentry, rotation de clés) que
  je n'ai pas re-couverts ici pour rester focalisé sur vos 4 demandes.
