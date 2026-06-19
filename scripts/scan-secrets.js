import fs from 'fs/promises';
import path from 'path';

const repoRoot = process.cwd();
const scanDirs = ['src', 'scripts', 'supabase'];
const exts = ['.js', '.jsx', '.ts', '.tsx', '.env', '.json', '.html'];
const excludeFiles = new Set(['package-lock.json', 'security-scan-results.txt']);
const excludePatterns = [
  /\.md$/i,
  /SECURITY_/i,
  /AUDIT_SECURITY/i,
];

const secretRegex = /sk_live_[a-zA-Z0-9]+|sk_test_[a-zA-Z0-9]+|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/;

const keywordLineRegex = /(?:api_key|apikey|access_token|auth_token)\s*[:=]\s*['"][^'"]{8,}['"]/i;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'dist'].includes(e.name)) continue;
      results.push(...await walk(full));
    } else if (exts.includes(path.extname(e.name)) && !excludeFiles.has(e.name)) {
      if (!excludePatterns.some((pattern) => pattern.test(full))) {
        results.push(full);
      }
    }
  }
  return results;
}

(async function main() {
  console.log('Scanning source files for potential secrets...');
  const files = [];
  for (const dir of scanDirs) {
    const fullDir = path.join(repoRoot, dir);
    try {
      await fs.access(fullDir);
      files.push(...await walk(fullDir));
    } catch {
      // directory may not exist
    }
  }

  let found = 0;
  for (const f of files) {
    try {
      const content = await fs.readFile(f, 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach((ln, i) => {
        if (secretRegex.test(ln) || keywordLineRegex.test(ln)) {
          console.log(`${f}:${i + 1}: ${ln.trim()}`);
          found++;
        }
      });
    } catch {
      // ignore unreadable files
    }
  }

  if (found === 0) {
    console.log('No obvious secrets found.');
    process.exit(0);
  }

  console.log(`Found ${found} potential secret(s). Review the output above.`);
  process.exit(1);
})();
