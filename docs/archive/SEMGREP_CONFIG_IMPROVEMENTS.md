# Semgrep Configuration Improvements — Wakkany

## 🔍 Améliorations apportées

### 1. **Ajout de règles Wakkany-Specific**

```yaml
- id: xp-grant-via-rpc-only
  severity: HIGH
  message: XP grants should always go through grantXp() RPC, never setXp() directly.

- id: skill-unlock-via-rpc-only
  severity: HIGH
  message: Skill unlocks must go through unlock_skill_secure RPC.

- id: game-session-tracking-required
  severity: MEDIUM
  message: Game completion should call completeGame() RPC for analytics.
```

### 2. **Supabase-Specific Security Checks**

```yaml
- id: supabase-missing-rls
  severity: HIGH
  message: Ensure Row-Level Security (RLS) is enabled on tables.

- id: supabase-direct-upsert-not-recommended
  severity: MEDIUM
  message: Use RPC functions instead of direct upserts.

- id: supabase-no-anon-key-in-build
  severity: HIGH
  message: Never hardcode service role keys (only anon key is safe).
```

### 3. **Vite Environment Variables**

```yaml
- id: vite-env-prefix-required
  severity: MEDIUM
  message: Use import.meta.env.VITE_* instead of process.env in frontend.
```

### 4. **Optimized Paths & Exclusions**

**Include:**
- `src/**` — Main source code
- `scripts/**` — Automation scripts
- `.github/workflows/**` — CI/CD
- `supabase/functions/**` — Edge functions

**Exclude:**
- All test files (`**/*.test.*`, `**/*.spec.*`)
- Build outputs (`dist/`, `build/`, `.next/`)
- Dependencies (`node_modules/`)
- Documentation (`docs/`, `docs-generated/`)
- Wakkany-specific docs (`AMELIORATIONS_wakkany.md`)

---

## 📊 Severity Levels

| Level | Impact | Action |
|---|---|---|
| **CRITICAL** | 🛑 Pipeline fails | Fix immediately |
| **ERROR** | ❌ Security issue | Fix in current sprint |
| **HIGH** | ⚠️ Best practice | Fix soon |
| **MEDIUM** | ℹ️ Consider | Fix in next release |
| **WARNING** | 💡 Info | Low priority |

---

## 🔒 Security Rules by Category

### Injection Attacks
- `avoid-eval` (CRITICAL)
- `potential-sql-injection` (CRITICAL)
- `command-injection-risk` (CRITICAL)
- `path-traversal-risk` (HIGH)

### Authentication & Authorization
- `auth-bypass-pattern` (HIGH)
- `backend-secrets-exposed-to-frontend` (CRITICAL)
- `avoid-hardcoded-secrets` (ERROR)

### Data Privacy
- `sensitive-data-logging` (HIGH)
- `supabase-missing-rls` (HIGH)

### Cryptography
- `weak-crypto-md5-sha1` (HIGH)
- `insecure-random-for-crypto` (HIGH)

### Web Security
- `avoid-innerhtml` (WARNING)
- `avoid-dangerouslysetinnerhtml` (WARNING)
- `cors-allow-all-origins` (HIGH)
- `missing-x-frame-options` (MEDIUM)

### Wakkany-Specific
- `xp-grant-via-rpc-only` (HIGH)
- `skill-unlock-via-rpc-only` (HIGH)
- `game-session-tracking-required` (MEDIUM)

---

## 🧪 Testing Locally

### Install Semgrep
```bash
pip install semgrep
```

### Run against your code
```bash
semgrep --config .semgrep.yml src/ --error
```

### See detailed output
```bash
semgrep --config .semgrep.yml src/ --json | jq '.results'
```

### Dry-run (show what would fail in CI)
```bash
semgrep --config .semgrep.yml . --error --quiet
```

---

## 🚀 In Your CI/CD Pipeline

The GitHub Actions workflow (`ci-cd.yml`) runs:

```yaml
- run: python -m semgrep --config .semgrep.yml --error --quiet .
```

**If any CRITICAL or ERROR is found:**
- Pipeline stops ❌
- You see which rule failed
- You fix the code
- You re-push
- Pipeline continues ✅

---

## 📋 Example Violations

### Hardcoded Secret ❌

**File:** `src/config/supabase.js`
```javascript
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

**Semgrep detects:**
```
ERROR — avoid-hardcoded-secrets
  Avoid hard-coded credentials...
  File: src/config/supabase.js:3
  Found: const SUPABASE_KEY = "eyJhbGciOi..."
```

**Fix ✅**
```javascript
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

### XP Manipulation ❌

**File:** `src/hooks/useGameRoom.js`
```javascript
const handleWin = () => {
  setXp(prev => prev + 1000);  // ❌ CHEATING!
};
```

**Semgrep detects:**
```
HIGH — xp-grant-via-rpc-only
  XP grants should always go through grantXp() RPC...
  File: src/hooks/useGameRoom.js:45
```

**Fix ✅**
```javascript
const handleWin = async () => {
  await completeGame({ mode: 'quiz', won: true, xp: 1000 });
};
```

---

### Missing RLS ❌

**File:** `src/utils/supabaseClient.js`
```javascript
const getPlayers = async () => {
  const { data } = await supabase
    .from('game_room_players')  // ❌ No RLS check
    .select('*');
  return data;
};
```

**Semgrep detects:**
```
HIGH — supabase-missing-rls
  Ensure Row-Level Security (RLS) is enabled...
  File: src/utils/supabaseClient.js:67
```

**Fix ✅** (In Supabase dashboard)
```sql
ALTER TABLE game_room_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_own"
  ON game_room_players FOR SELECT
  USING (device_id = current_setting('app.device_id')::text);
```

---

## 🎯 Best Practices

### 1. **Always use RPC for state changes**

❌ Don't:
```javascript
setXp(xp + 100);
setUnlockedSkills([...skills, newSkill]);
```

✅ Do:
```javascript
await completeGame({ mode: 'quiz', won: true });
// This calls the RPC which validates and updates securely
```

### 2. **Never expose backend secrets in frontend**

❌ Don't:
```javascript
process.env.SUPABASE_SERVICE_ROLE_KEY
process.env.DATABASE_URL
process.env.STRIPE_SECRET_KEY
```

✅ Do:
```javascript
import.meta.env.VITE_SUPABASE_ANON_KEY
// Only VITE_* variables are safe in frontend
```

### 3. **Always validate user input**

❌ Don't:
```javascript
fs.readFile(userProvidedPath);
child_process.exec(`command ${userInput}`);
```

✅ Do:
```javascript
const safePath = path.join(__dirname, 'safe-folder', sanitizedInput);
fs.readFile(safePath);

child_process.execFile('command', [userInput]);  // Arguments separated
```

### 4. **Log safely (no secrets)**

❌ Don't:
```javascript
console.log('User token:', token);
console.error('Password:', password);
```

✅ Do:
```javascript
console.log('User authenticated successfully');
console.error('Authentication failed');
```

---

## 🔄 Ignoring Rules (Use Sparingly)

If you have a legitimate reason to ignore a rule, be explicit:

```javascript
// semgrep:ignore=avoid-hardcoded-secrets
// This is a test fixture with fake credentials
const FAKE_TOKEN = "test_token_xxx";
```

Never just `# semgrep:ignore` without the rule ID — you won't know what you're ignoring.

---

## 📈 Continuous Improvement

### Monthly Semgrep Updates

```bash
pip install --upgrade semgrep

# New vulnerability patterns are added continuously
# Keep your security scanner fresh
```

### Custom Rules for Wakkany

The `.semgrep.yml` includes game-specific security patterns:
- XP grant validation
- Skill unlock authentication
- Game session tracking

Add more as your game grows!

---

## 📞 Questions?

**Common issues:**

1. **"Rule X is too strict"** → Add `pattern-not` exceptions
2. **"I have a legitimate edge case"** → Use `semgrep:ignore=rule-id` with a comment
3. **"My code is correct but semgrep flags it"** → Add your pattern to `pattern-not`
4. **"Want to add a custom rule?"** → Add a new rule block to `.semgrep.yml`

All changes to `.semgrep.yml` must be committed and tested locally before pushing!
