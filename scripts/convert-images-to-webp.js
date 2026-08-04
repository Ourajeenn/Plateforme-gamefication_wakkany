#!/usr/bin/env node
/**
 * convert-images-to-webp.js
 * Convertit les PNG/JPG/JPEG en WebP pour réduire la taille
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DIRS = [
  'public',
  'src/assets',
];

const EXTENSIONS = ['.png', '.jpg', '.jpeg'];

async function convertImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!EXTENSIONS.includes(ext)) return;

    const outputPath = filePath.replace(ext, '.webp');
    
    // Skip if webp already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  ${outputPath} exists, skipping`);
      return;
    }

    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log(`✅ ${filePath} → ${outputPath}`);

    // Optionally delete original
    // fs.unlinkSync(filePath);
  } catch (err) {
    console.error(`❌ Error converting ${filePath}:`, err.message);
  }
}

async function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      await convertImage(filePath);
    }
  }
}

async function main() {
  console.log('🖼️  Converting images to WebP...\n');

  for (const dir of DIRS) {
    console.log(`📁 Processing: ${dir}`);
    await processDirectory(dir);
    console.log();
  }

  console.log('✨ Done!');
}

main().catch(console.error);
