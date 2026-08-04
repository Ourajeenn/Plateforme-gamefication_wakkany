#!/usr/bin/env node
/**
 * analyze-image-sizes.js
 * Affiche la taille des images avant/après conversion WebP
 */

import fs from 'fs';
import path from 'path';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function analyzeImages(dir, depth = 0) {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir);
  let results = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = [...results, ...analyzeImages(filePath, depth + 1)];
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        results.push({
          name: file,
          path: filePath,
          size: stat.size,
          ext,
        });
      }
    }
  });

  return results;
}

async function main() {
  console.log('🖼️  Image Size Analysis\n');

  const dirs = ['public', 'src/assets'];
  let totalOriginal = 0;
  let totalWebP = 0;

  for (const dir of dirs) {
    console.log(`📁 ${dir}`);
    const images = analyzeImages(dir);
    
    if (images.length === 0) {
      console.log('  (no images found)\n');
      continue;
    }

    images.forEach((img) => {
      console.log(`  ${img.name.padEnd(40)} ${formatBytes(img.size)}`);
      
      if (img.ext !== '.webp') {
        totalOriginal += img.size;
      } else {
        totalWebP += img.size;
      }
    });
    console.log();
  }

  if (totalOriginal > 0 || totalWebP > 0) {
    const savings = totalOriginal - totalWebP;
    const savingsPercent = totalOriginal > 0 ? Math.round((savings / totalOriginal) * 100) : 0;
    
    console.log('📊 Summary:');
    console.log(`  Original formats: ${formatBytes(totalOriginal)}`);
    console.log(`  WebP formats: ${formatBytes(totalWebP)}`);
    console.log(`  Total savings: ${formatBytes(savings)} (${savingsPercent}%)`);
  }
}

main().catch(console.error);
