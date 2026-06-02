# 🛡️ Plan d'Actions - Sécurité Wakkany

**Généré** : 2 Juin 2026  
**Statut** : 📋 EN COURS

---

## 🔴 PRIORITÉ CRITIQUE (Cette Semaine)

### 1. ✅ **[FAIT] Corriger la CSP dans nginx.conf**
- **Fichier** : nginx.conf
- **Status** : ✅ COMPLETE
- **Changement** : CSP étendue pour supporter Supabase, Iconify, PostImg
- **Test** : 
  ```bash
  curl -I http://localhost | grep Content-Security-Policy
  ```

### 2. **[TODO] Vérifier RLS dans Supabase**
**Importance** : CRITIQUE  
**Durée Estimée** : 30min

```sql
-- Étapes :
1. Aller dans Supabase Dashboard
2. SQL Editor → Vérifier les policies RLS
3. Tables à vérifier :
   - players
   - achievements
   - leaderboards
   - boss_encounters
   
-- Template pour vérifier :
SELECT 
  schemaname, 
  tablename, 
  'RLS ENABLED' as status 
FROM pg_tables 
WHERE schemaname = 'public';

-- Pour chaque table, vérifier les policies :
SELECT * FROM pg_policies 
WHERE tablename = 'players';
```

**Actions** :
- [ ] Vérifier que RLS est ENABLED sur toutes les tables
- [ ] S'assurer que les policies limitent l'accès par user_id
- [ ] Tester qu'un user ne peut pas voir les données des autres

### 3. **[TODO] Configurer les URLs Autorisées Supabase**
**Durée Estimée** : 15min

```bash
# Dans Supabase Dashboard :
# Authentication → URL Configuration

# À configurer :
- Site URL : https://yourdomain.com (production)
- Redirect URLs :
  - https://yourdomain.com/login/callback
  - https://yourdomain.com/auth/callback
  - http://localhost:5173/login/callback (dev)
```

---

## 🟠 PRIORITÉ HAUTE (Cette Semaine)

### 4. **[TODO] Mettre à Jour les Dépendances Mineures**
**Durée Estimée** : 1h + tests

```bash
# 1. Mettre à jour les dépendances disponibles
npm update

# 2. Vérifier les dépendances outdated
npm outdated

# 3. Lancer les tests
npm run build
npm run lint

# 4. Commiter et pousser
git add -A
git commit -m "chore: update dependencies to latest minor versions"
git push origin "features-new-fonctionnalités/dev"
```

**Packages à mettre à jour progressivement** :
```json
{
  "@supabase/supabase-js": "2.106.2",  // 2.105.4 → 2.106.2
  "autoprefixer": "10.5.0",             // 10.4.27 → 10.5.0
  "react-router-dom": "7.16.0"          // 7.15.1 → 7.16.0
}
```

### 5. **[TODO] Implémenter Rate Limiting Client**
**Durée Estimée** : 1h30

```bash
# Installer rate-limiter-flexible
npm install rate-limiter-flexible
```

**Fichier à créer** : `src/utils/rateLimiter.js`
```javascript
import { RateLimiter } from 'rate-limiter-flexible';

export const loginLimiter = new RateLimiter({
  points: 5,        // 5 tentatives
  duration: 15 * 60 // par 15 minutes
});

export const apiLimiter = new RateLimiter({
  points: 100,      // 100 requêtes
  duration: 60      // par minute
});

// Usage dans les composants :
export async function protectedLogin(email, password) {
  try {
    await loginLimiter.consume('login-' + email);
    // Faire le login...
  } catch (err) {
    if (err.msBeforeNext) {
      throw new Error(`Trop de tentatives. Réessayez dans ${err.msBeforeNext / 1000}s`);
    }
  }
}
```

### 6. **[TODO] Ajouter Validation d'Entrées avec Zod**
**Durée Estimée** : 2h

```bash
npm install zod
```

**Exemple de schéma** : `src/schemas/index.js`
```javascript
import { z } from 'zod';

export const playerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(3).max(120).optional(),
});

export const quizConfigSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeLimit: z.number().min(10).max(300),
  numberOfQuestions: z.number().min(1).max(50),
});

// Usage :
import { playerSchema } from '@/schemas';

try {
  const validPlayer = playerSchema.parse(userData);
} catch (error) {
  console.error('Validation failed:', error.errors);
}
```

---

## 🟡 PRIORITÉ MOYENNE (Semaines 2-3)

### 7. **[TODO] Configurer Sentry pour Error Tracking**
**Durée Estimée** : 2h

```bash
npm install @sentry/react
```

**Dans main.jsx** :
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### 8. **[TODO] Audit CORS Complet**
**Durée Estimée** : 45min

```bash
# Tester que les requêtes CORS fonctionnent
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://api.example.com/players \
  -v

# Vérifier les headers CORS reçus
# Access-Control-Allow-Origin
# Access-Control-Allow-Methods
# Access-Control-Allow-Headers
```

### 9. **[TODO] Implémenter HTTPS en Production**
**Durée Estimée** : 1h

**Options** :
- [ ] Let's Encrypt (gratuit)
- [ ] Certificate Authority
- [ ] Cloudflare SSL/TLS

**Configuration nginx avec HTTPS** :
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name your.domain;
    return 301 https://$server_name$request_uri;
}
```

### 10. **[TODO] Secrets Management**
**Durée Estimée** : 1h

**Implémentation** :
```bash
# Créer .env.local
# ⚠️ NE PAS COMMITER - Vérifier .gitignore

# Structure :
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxx
VITE_SENTRY_DSN=https://xxxx@sentry.io/yyyy
```

**Pour CI/CD** (GitHub Actions, GitLab CI) :
```yaml
# .github/workflows/deploy.yml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_KEY }}
```

---

## 🟢 PRIORITÉ BASSE (Semaines 4+)

### 11. **[TODO] Audit de Sécurité Externe**
**Durée Estimée** : 3-5 jours professionnels  
**Budget Estimé** : €1,500 - €3,000

**Inclure** :
- Pen testing complet
- Analyse du code source
- Test des APIs
- Vérification des configurations

### 12. **[TODO] Implémenter CORS Headers**
**Durée Estimée** : 30min

```javascript
// src/middleware/corsMiddleware.js
export function setupCORS(app) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 
      process.env.NODE_ENV === 'production' 
        ? 'https://yourdomain.com'
        : 'http://localhost:3000'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}
```

### 13. **[TODO] Logging et Monitoring Avancé**
**Durée Estimée** : 3h

```bash
npm install winston winston-transport
```

```javascript
// src/utils/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

---

## ✅ Checklist Avant Déploiement en PRODUCTION

- [ ] npm audit passed
- [ ] CSP configurée correctement
- [ ] RLS Supabase activé et testé
- [ ] URLs autorisées Supabase configurées
- [ ] Rate limiting implémenté
- [ ] Sentry configuré
- [ ] HTTPS + HSTS activé
- [ ] Dépendances à jour
- [ ] Tests de sécurité passés
- [ ] Audit externe complété
- [ ] Rotation des clés Supabase faite
- [ ] Backup/Disaster Recovery plan en place

---

## 📅 Timeline Recommandée

```
Semaine 1  : Actions 1-3 (Critique)
Semaine 2  : Actions 4-6 (Haute)
Semaine 3  : Actions 7-10 (Moyenne)
Semaine 4+ : Actions 11-13 (Basse)

TOTAL : ~12-15h de travail + 3-5j audit externe
```

---

## 📊 Statut Suivi

| # | Action | Status | Assigné | Date Fin |
|---|--------|--------|---------|----------|
| 1 | Corriger CSP | ✅ DONE | Bot | 2 Jun |
| 2 | Vérifier RLS | ⏳ TODO | - | - |
| 3 | URLs Supabase | ⏳ TODO | - | - |
| 4 | Update deps | ⏳ TODO | - | - |
| 5 | Rate Limiting | ⏳ TODO | - | - |
| 6 | Validation Zod | ⏳ TODO | - | - |
| 7 | Sentry Setup | ⏳ TODO | - | - |
| 8 | Audit CORS | ⏳ TODO | - | - |
| 9 | HTTPS Setup | ⏳ TODO | - | - |
| 10 | Secrets Mgmt | ⏳ TODO | - | - |
| 11 | Audit Externe | ⏳ TODO | - | - |
| 12 | CORS Headers | ⏳ TODO | - | - |
| 13 | Logging Avancé | ⏳ TODO | - | - |

---

## 🔗 Ressources Utiles

- **Supabase Security** : https://supabase.com/docs/guides/auth
- **OWASP Top 10** : https://owasp.org/www-project-top-ten/
- **CSP Generator** : https://csp-evaluator.withgoogle.com/
- **Zod Documentation** : https://zod.dev/
- **Rate Limiter** : https://github.com/animir/rate-limiter-flexible
- **Sentry** : https://sentry.io/

---

**Dernière Mise à Jour** : 2 Juin 2026  
**Prochaine Révision** : 2 Juillet 2026

