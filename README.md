<div align="center">

# ⚔️ Wakkany

**Plateforme de gamification familiale — renoué avec vos racines d'origine**

[![Vercel](https://img.shields.io/badge/Déployé%20sur-Vercel-black?logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/Licence-Privée-red)](#)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-blueviolet?logo=pwa)](#)

</div>

---

## 📖 Présentation

**Wakkany** est une plateforme de gamification culturelle et familiale qui transforme l'apprentissage des origines, de la culture et de l'histoire en une expérience interactive et engageante.

Les joueurs créent un avatar, rejoignent un clan, progressent dans un arbre de compétences, accomplissent des quêtes, débloquent des succès et s'affrontent dans des quiz et mini-jeux — le tout ancré dans un univers narratif riche et immersif.

### ✨ Fonctionnalités principales

| Module | Description |
|--------|-------------|
| 🧙 **Profil & Avatar** | Création de personnage, progression visuelle par niveau |
| 🌳 **Arbre de compétences** | Déblocage de talents avec XP, réinitialisation possible |
| 🏆 **Quêtes & Flash-quêtes** | Missions temporisées avec récompenses XP |
| 🎖️ **Succès** | Système d'achievements débloqués automatiquement |
| ⚔️ **Clans** | Pactes de clans, identité collective |
| 🎮 **Quiz & Mini-jeux** | Modules interactifs de connaissance culturelle |
| 📊 **Tableau de bord** | Stats personnelles, historique XP, classement |
| 🔔 **Notifications** | Toasts temps réel + file hors-ligne synchronisée |
| 🌐 **Multijoueur** | Salles de jeu en temps réel via Supabase Realtime |
| 📴 **Mode Offline** | PWA complète — fonctionne sans connexion |

---

## 🛠️ Stack technique

| Couche | Technologie |
|--------|------------|
| **Frontend** | React 18 + Vite 7 |
| **Routing** | React Router DOM v7 |
| **Styling** | Tailwind CSS v3 + CSS custom |
| **Animations** | Framer Motion |
| **3D** | Three.js + React Three Fiber |
| **Backend / Auth** | Supabase (PostgreSQL + RLS + Realtime) |
| **Validation** | Zod |
| **Graphiques** | Recharts |
| **Icônes** | Iconify |
| **Tests unitaires** | Vitest + Testing Library |
| **Tests E2E** | Playwright |
| **CI/CD** | GitHub Actions + Vercel |
| **Conteneurisation** | Docker + Nginx |

---

## 📁 Structure du projet

```
wakkany/
├── .github/workflows/          # CI/CD (ci-cd.yml, keep-alive.yml)
├── docs/                       # Documentation du projet
│   ├── AMELIORATIONS.md        # Roadmap fonctionnelle
│   ├── AUDIT_SECURITY.md       # Audit de sécurité
│   ├── SECURITY_ACTION_PLAN.md # Plan d'actions sécurité
│   └── SECURITY_BEST_PRACTICES.md
├── public/                     # Assets statiques servis directement
│   └── assets/                 # Images, sons, icônes
├── scripts/                    # Scripts utilitaires dev
│   ├── scan-secrets.js         # Détection de secrets dans le code
│   ├── check-case.cjs          # Vérification casse fichiers
│   └── setup-git-secrets.ps1   # Config git-secrets
├── src/
│   ├── assets/histoire/        # Images narrative (importées via Vite)
│   ├── components/             # Composants UI réutilisables
│   │   ├── common/             # Composants génériques (Loader, Chat…)
│   │   ├── layout/             # Navigation, structure
│   │   └── …                   # Domaine métier
│   ├── constants/              # Constantes globales
│   ├── context/                # Contextes React (ThemeContext…)
│   ├── data/                   # Données statiques (niveaux, succès…)
│   ├── hooks/                  # Hooks custom (useAuth, usePlayerData…)
│   ├── pages/                  # Composants de page + App.jsx
│   ├── routes/                 # Lazy-loading des routes
│   ├── schemas/                # Schémas de validation Zod
│   └── utils/                  # Fonctions utilitaires
├── supabase/
│   ├── functions/              # Edge Functions Supabase
│   └── migrations/             # Migrations SQL versionnées
├── tests/
│   └── e2e/                    # Tests Playwright end-to-end
├── Dockerfile                  # Image Docker production
├── nginx.conf                  # Config Nginx (utilisée par Docker)
├── vercel.json                 # Config déploiement Vercel
├── vite.config.js              # Config Vite (PWA, compression, alias)
└── package.json
```

---

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 9
- Un projet **Supabase** (optionnel — l'app fonctionne en mode local sans Supabase)

### 1. Cloner le dépôt

```bash
git clone https://github.com/Ourajeenn/Plateforme-gamefication_wakkany.git
cd Plateforme-gamefication_wakkany
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Renseigner dans `.env.local` :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

> **Sans ces variables**, l'application démarre en **mode démo local** — toutes les données sont stockées dans `localStorage`.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:5173](http://localhost:5173)

---

## 📜 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (hot reload) |
| `npm run build` | Build de production optimisé |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Analyse ESLint du code source |
| `npm run test` | Tests unitaires avec Vitest |
| `npm run security:scan` | Détection de secrets dans le code |
| `npm run security:audit` | Audit des dépendances npm |

---

## 🐳 Docker

Construire et lancer l'image de production :

```bash
docker build -t wakkany .
docker run -p 8080:80 wakkany
```

---

## ☁️ Déploiement

### Vercel (recommandé)

Le projet est configuré pour un déploiement automatique via Vercel :
- **Branch `main`** → production
- **Branch `dev`** → preview

La configuration est dans [`vercel.json`](./vercel.json).

### Docker / Self-hosted

Le [`Dockerfile`](./Dockerfile) génère une image Nginx multi-stage optimisée pour la production. La config Nginx ([`nginx.conf`](./nginx.conf)) gère le routing SPA (toutes les routes → `index.html`).

---

## 🗄️ Base de données (Supabase)

Les migrations SQL sont versionnées dans `supabase/migrations/` :

| Migration | Description |
|-----------|-------------|
| `20260618000000_secure_profile_updates.sql` | RLS profiles sécurisé |
| `20260723000000_game_rooms.sql` | Tables multijoueur + RLS |

Pour appliquer les migrations :

```bash
supabase db push
```

---

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables Supabase
- **Rate limiting** côté client (`rate-limiter-flexible`)
- **Validation des entrées** avec Zod sur tous les formulaires
- **Scan de secrets** automatisé (`npm run security:scan`)
- **Audit npm** dans le CI (`npm run security:audit`)

Voir [`docs/SECURITY_ACTION_PLAN.md`](./docs/SECURITY_ACTION_PLAN.md) et [`docs/AUDIT_SECURITY.md`](./docs/AUDIT_SECURITY.md) pour le détail.

---

## 🧪 Tests

### Unitaires (Vitest)

```bash
npm run test
```

### End-to-End (Playwright)

```bash
npx playwright test
```

Les tests E2E se trouvent dans `tests/e2e/`.

---

## 🗺️ Roadmap

Consulter [`docs/AMELIORATIONS.md`](./docs/AMELIORATIONS.md) pour la roadmap complète, notamment :

- [ ] Système de branches narratives
- [ ] Leaderboard global en temps réel
- [ ] Avatar évolutif selon le niveau
- [ ] Arbre de quêtes avancé
- [ ] Skill tree persisté en base de données
- [ ] Mode tournoi multijoueur

---

## 🤝 Contribution

Ce projet est **privé**. Pour contribuer, contacter l'équipe Wakkany.

---

## 📄 Licence

Projet privé — tous droits réservés © Wakkany 2026.

---

<div align="center">
  <sub>Fait avec ❤️ pour reconnecter les familles à leurs racines</sub>
</div>
