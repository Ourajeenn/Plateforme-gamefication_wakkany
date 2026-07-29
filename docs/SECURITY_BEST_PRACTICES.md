# 🛡️ Guide des Bonnes Pratiques de Sécurité - Wakkany

**Version** : 1.0  
**Mise à Jour** : 2 Juin 2026

---

## 📋 Table des Matières

1. Authentification
2. Stockage de Données
3. API & Requêtes
4. Gestion des Secrets
5. Frontend Security
6. Infrastructure

---

## 🔐 Authentification

### ✅ À FAIRE — Authentification

#### 1. **Toujours utiliser Supabase Auth**

```javascript
// ✅ BON
import { supabase } from '@/utils/supabaseClient';

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw new Error(error.message);
  return data.user;
}
```

#### 2. **Vérifier l'authentification côté serveur**

```javascript
// ✅ BON - Vérifier la session
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  throw new Error('Unauthorized');
}
```

#### 3. **Utiliser PKCE pour OAuth**

```javascript
// ✅ BON - Supabase gère PKCE automatiquement
await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: window.location.origin + '/auth/callback'
  }
})
```

#### 4. **Stocker JWT de manière sécurisée**

```javascript
// ✅ BON - Supabase stocke automatiquement en httpOnly
// (Le SDK gère automatiquement le stockage sécurisé)

// ✅ BON - Accéder au JWT quand nécessaire
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

#### 5. **Logout Complet**

```javascript
// ✅ BON
export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Nettoyer le localStorage local aussi
  localStorage.removeItem('wakkany_active_session');
  window.location.href = '/';
}
```

---

### ❌ À NE PAS FAIRE — Authentification

#### 1. **Ne pas stocker le password en localStorage**

```javascript
// ❌ MAUVAIS
localStorage.setItem('password', password);

// ❌ MAUVAIS
const token = JSON.parse(localStorage.getItem('auth')).password;
```

#### 2. **Ne pas envoyer le password en plain text**

```javascript
// ❌ MAUVAIS
fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ 
    email: 'user@example.com',
    password: 'plaintext123'  // 🔴 DANGER
  })
});
```

#### 3. **Ne pas logger les credentials**

```javascript
// ❌ MAUVAIS
console.log('Login avec:', email, password);

// ❌ MAUVAIS
logger.info(`User logged in: ${email} / ${password}`);
```

---

## 💾 Stockage de Données

### ✅ À FAIRE — Stockage de Données

#### 1. **localStorage pour données non-sensibles seulement**

```javascript
// ✅ BON - Données de jeu
localStorage.setItem('wakkany_level', 5);
localStorage.setItem('wakkany_xp', 1250);
localStorage.setItem('wakkany_achievements', JSON.stringify(achievements));

// ✅ BON - Avatar preferences
localStorage.setItem('wakkany_avatar_aura', 'blue');
```

#### 2. **Utiliser les Row Level Security (RLS) de Supabase**

```sql
-- ✅ BON - Les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own players" ON players
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own players" ON players
  FOR UPDATE USING (auth.uid() = user_id);
```

#### 3. **Valider les données en base de données**

```sql
-- ✅ BON - Contraintes au niveau BD
ALTER TABLE players ADD CONSTRAINT check_level 
  CHECK (level >= 1 AND level <= 100);

ALTER TABLE achievements ADD CONSTRAINT check_date 
  CHECK (earned_at <= NOW());
```

#### 4. **Chiffrer les données sensibles**

```javascript
// ✅ BON - Supabase Vault pour chiffrement au repos
const { data, error } = await supabase
  .from('secret_data')
  .select('pgp_sym_decrypt(encrypted_value, $1)', secret)
  .single();
```

---

### ❌ À NE PAS FAIRE — Stockage de Données

#### 1. **Ne pas stocker tokens/secrets en localStorage**

```javascript
// ❌ MAUVAIS
localStorage.setItem('auth_token', user.access_token);
localStorage.setItem('api_key', 'sk_live_xxx');
```

#### 2. **Ne pas envoyer les données non-validées en BD**

```javascript
// ❌ MAUVAIS
await supabase
  .from('players')
  .insert({
    name: userInput,  // Non validé!
    email: emailInput // Non validé!
  });
```

#### 3. **Ne pas oublier RLS en production**

```javascript
// ❌ MAUVAIS - Sans RLS, n'importe qui peut lire toutes les données
const { data } = await supabase
  .from('players')
  .select('*');  // 🔴 Retourne TOUS les joueurs
```

---

## 🔌 API & Requêtes

### ✅ À FAIRE — API & Requêtes

#### 1. **Toujours valider et nettoyer les entrées**

```javascript
import { z } from 'zod';

const playerSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email(),
  age: z.number().min(3).max(120).optional(),
});

// Utilisation :
try {
  const validPlayer = playerSchema.parse(input);
  await savePlayer(validPlayer);
} catch (error) {
  console.error('Validation échouée:', error.errors);
}
```

#### 2. **Utiliser les prepared statements**

```javascript
// ✅ BON - Supabase utilise les prepared statements automatiquement
const { data } = await supabase
  .from('players')
  .select('*')
  .eq('email', email);  // Paramètre bindé automatiquement
```

#### 3. **Limiter les requêtes (rate limiting)**

```javascript
import { RateLimiter } from 'rate-limiter-flexible';

const limiter = new RateLimiter({
  points: 5,
  duration: 60 * 15  // 5 requêtes par 15 minutes
});

export async function loginWithRateLimit(email, password) {
  try {
    await limiter.consume('login-' + email);
    return await login(email, password);
  } catch (err) {
    throw new Error('Trop de tentatives. Réessayez plus tard.');
  }
}
```

#### 4. **Ajouter des timeouts**

```javascript
// ✅ BON - Timeout sur les requêtes
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch('/api/data', {
    signal: controller.signal
  });
} finally {
  clearTimeout(timeoutId);
}
```

#### 5. **Logger les erreurs sensibles seulement côté serveur**

```javascript
// ✅ BON
try {
  await supabase.from('players').select();
} catch (error) {
  // Côté serveur seulement
  logger.error('DB error:', error);  // Détails complets
  
  // Côté client
  toast.error('Erreur lors du chargement');  // Message générique
}
```

---

### ❌ À NE PAS FAIRE — API & Requêtes

#### 1. **Ne pas concaténer les valeurs dans les requêtes**

```javascript
// ❌ MAUVAIS - SQL Injection!
const query = `SELECT * FROM players WHERE email = '${email}'`;

// ✅ BON - Utiliser les paramètres bindés
const { data } = await supabase
  .from('players')
  .select('*')
  .eq('email', email);
```

#### 2. **Ne pas faire confiance aux données du client**

```javascript
// ❌ MAUVAIS
const userId = request.body.userId;  // Pas vérifié!

// ✅ BON
const { data: { user } } = await supabase.auth.getUser();
const userId = user.id;  // De la session authentifiée
```

#### 3. **Ne pas exponser les erreurs détaillées au client**

```javascript
// ❌ MAUVAIS
catch (error) {
  res.json({ error: error.message, stack: error.stack });
}

// ✅ BON
catch (error) {
  logger.error('Détails:', error);
  res.status(500).json({ error: 'Une erreur est survenue' });
}
```

#### 4. **Ne pas faire de requêtes sans autorisation**

```javascript
// ❌ MAUVAIS - Pas de vérification d'authentification
app.get('/api/players/:id', (req, res) => {
  // N'importe qui peut accéder!
});

// ✅ BON - Vérifier l'authentification
app.get('/api/players/:id', async (req, res) => {
  const { user, error } = await supabase.auth.getUser(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  
  // Vérifier que l'utilisateur accède à ses propres données
  if (user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
});
```

---

## 🔑 Gestion des Secrets

### ✅ À FAIRE — Gestion des Secrets

#### 1. **Utiliser des variables d'environnement**

```javascript
// ✅ BON
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

##### 2. **Avoir un .env.example**

```env
# .env.example
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxx
VITE_SENTRY_DSN=https://xxxxx@sentry.io/yyyy
```

##### 3. **Ignorer les fichiers .env**

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

##### 4. **Rotation régulière des clés**

```bash
# Tous les 90 jours minimum
# 1. Créer une nouvelle clé dans Supabase
# 2. Remplacer dans les variables d'environnement
# 3. Révoquer l'ancienne clé
```

##### 5. **Utiliser les secrets du CI/CD**

```yaml
# .github/workflows/deploy.yml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

### ❌ À NE PAS FAIRE — Gestion des Secrets

#### 1. **Ne pas commiter les .env**

```bash
# ❌ MAUVAIS
git add .env
git commit -m "Added env"

# ✅ BON
git add .env.example
git commit -m "Added env template"
```

#### 2. **Ne pas harcoder les secrets**

```javascript
// ❌ MAUVAIS
const API_KEY = 'sk_live_1234567890';

// ✅ BON
const API_KEY = import.meta.env.VITE_API_KEY;
```

#### 3. **Ne pas versionner les clés privées**

```javascript
// ❌ MAUVAIS
const privateKey = 'sk_test_xxxxxxxxxxxxxxxx';

// ✅ BON - Générer une clé serverless ou utiliser Supabase RLS
```

---

## 🎨 Frontend Security

### ✅ À FAIRE — Frontend Security

#### 1. **Sanitizer les URLs utilisateur**

```javascript
// ✅ BON
import DOMPurify from 'dompurify';

const userInput = '<img src=x onerror="alert(1)">';
const clean = DOMPurify.sanitize(userInput);
```

#### 2. **Utiliser dangerouslySetInnerHTML avec prudence**

```javascript
// ❌ Si possible, éviter
// ✅ Si nécessaire, utiliser une librairie de sanitization
import sanitizeHtml from 'sanitize-html';

const safHtml = sanitizeHtml(userContent);
return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
```

#### 3. **Valider les types de fichiers uploadés**

```javascript
// ✅ BON
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = 5 * 1024 * 1024;  // 5MB

export function validateFile(file) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Type de fichier non autorisé');
  }
  if (file.size > maxSize) {
    throw new Error('Fichier trop volumineux');
  }
  return true;
}
```

#### 4. **Implémenter CSRF protection**

```javascript
// ✅ BON - Supabase gère automatiquement
// Les tokens CSRF sont créés automatiquement par Supabase
```

#### 5. **Désactiver la complétion automatique des passwords**

```html
<!-- ✅ BON -->
<input 
  type="password" 
  autocomplete="new-password"
/>
```

---

### ❌ À NE PAS FAIRE — Frontend Security

#### 1. **Ne pas faire confiance aux données du navigateur**

```javascript
// ❌ MAUVAIS
const userId = localStorage.getItem('userId');
const role = localStorage.getItem('role');

// ✅ BON - Récupérer de la session authentifiée
const { data: { user } } = await supabase.auth.getUser();
const userId = user.id;
```

#### 2. **Ne pas vérifier uniquement côté client**

```javascript
// ❌ MAUVAIS
if (user.role === 'admin') {
  // Afficher le bouton admin
}

// ✅ BON - Vérifier aussi côté serveur/BD
const { data: { user } } = await supabase.auth.getUser();
if (user.role !== 'admin') {
  throw new Error('Unauthorized');
}
```

---

### 🏗️ Infrastructure

### ✅ À FAIRE — Infrastructure

#### 1. **Activer HTTPS**

```nginx
# ✅ BON
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

#### 2. **Configurer HSTS**

```nginx
# ✅ BON
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

#### 3. **Configurer CSP correctement**

```nginx
# ✅ BON (voir config nginx corrigée)
add_header Content-Security-Policy "default-src 'self'; ...";
```

#### 4. **Logger et monitorer**

```javascript
// ✅ BON
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});
```

#### 5. **Faire des backups réguliers**

```bash
# ✅ BON - Backup Supabase automatique
# Configuration dans Supabase Dashboard → Settings → Backups
# Fréquence minimale : quotidienne
```

---

### ❌ À NE PAS FAIRE — Infrastructure

#### 1. **Ne pas exposer les détails d'erreur en production**

```javascript
// ❌ MAUVAIS
console.error(error);
window.alert(error.message);

// ✅ BON
logger.error('Error:', error);  // Serveur seulement
ui.showError('Une erreur est survenue');  // Client message générique
```

#### 2. **Ne pas ignorer les warnings de sécurité**

```bash
# ❌ MAUVAIS
npm audit --ignore

# ✅ BON
npm audit
npm audit fix
```

---

## 📋 Checklist de Révue de Code

Avant de merger du code, vérifier :

- [ ] Pas de `console.log()` avec données sensibles
- [ ] Pas de hardcoded secrets
- [ ] Pas de `dangerouslySetInnerHTML` sans sanitization
- [ ] Pas de SQL injection possible
- [ ] Validation des inputs en place
- [ ] RLS Supabase vérifiée
- [ ] Pas de secrets dans git history
- [ ] Tests de sécurité passés
- [ ] CORS headers corrects
- [ ] Erreurs loggées côté serveur uniquement

---

## 🔍 Commandes de Vérification

```bash
# Vérifier les secrets exposés
npm install -g git-secrets
git secrets --install
git secrets --scan

# Vérifier les dépendances non sûres
npm audit

# Vérifier les secrets hardcodés
grep -r "sk_live\|sk_test\|password\|secret\|token" src/ --include="*.js" --include="*.jsx"

# Vérifier les données en localStorage
grep -r "localStorage.setItem" src/ --include="*.js" --include="*.jsx"

# Vérifier les requêtes CORS
curl -H "Origin: http://localhost:3000" http://api.example.com -v
```

---

## 📚 Ressources

- **Supabase Security** : [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **OWASP Top 10** : [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
- **MDN Web Security** : [https://developer.mozilla.org/en-US/docs/Web/Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- **Zod Documentation** : [https://zod.dev/](https://zod.dev/)
- **Content Security Policy** : [https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---
**Dernière Mise à Jour** : 2 Juin 2026  
**Prochaine Révision** : 2 Juillet 2026

