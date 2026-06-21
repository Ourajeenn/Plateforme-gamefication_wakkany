const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const filePaths = new Set();
walkDir('./src', (filePath) => {
  filePaths.add(filePath.replace(/\\/g, '/').toLowerCase());
});

let errors = 0;

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const dir = path.dirname(filePath);
      let absoluteImport = path.resolve(dir, importPath).replace(/\\/g, '/');
      const relativeToRoot = absoluteImport.substring(absoluteImport.indexOf('/src/') + 1);
      
      let found = false;
      const exts = ['', '.js', '.jsx', '/index.js', '/index.jsx'];
      for (const ext of exts) {
        if (filePaths.has((relativeToRoot + ext).toLowerCase())) {
          found = true;
          // check if case matches exactly!
          const actualPath = (relativeToRoot + ext);
          const dirContents = fs.readdirSync(path.dirname(absoluteImport + ext));
          const basename = path.basename(absoluteImport + ext);
          if (!dirContents.includes(basename)) {
             // Handle extensions correctly
             const dirContentsNoExt = dirContents.map(f => f.replace(/\.[^/.]+$/, ""));
             if (!dirContents.includes(basename) && !dirContentsNoExt.includes(basename)) {
                 console.error(`Case mismatch in ${filePath}: import '${importPath}'`);
                 errors++;
             }
          }
          break;
        }
      }
      if (!found) {
        console.error(`Unresolved import in ${filePath}: import '${importPath}'`);
        errors++;
      }
    }
  }
});

if (errors === 0) console.log("No import case issues found.");
