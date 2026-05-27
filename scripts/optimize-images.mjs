/**
 * optimize-images.mjs
 * Compresses all images in public/ using sharp.
 * - WebP gallery/hero images → max 1600px wide, quality 75
 * - Avatar PNGs → max 200px wide, quality 80 (kept as webp)
 * - Menu item PNGs → max 600px wide, quality 80 (kept as webp)
 * - Logo → max 400px wide, quality 82
 * Run: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../public');

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllFiles(full)));
    } else if (/\.(webp|png|jpg|jpeg)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function getFileSize(filePath) {
  const s = await stat(filePath);
  return s.size;
}

function getConfig(filePath) {
  const rel = filePath.replace(ROOT, '').replace(/\\/g, '/');
  if (rel.includes('/avatars/')) {
    return { width: 200, quality: 78, outputFormat: 'webp' };
  }
  if (rel.includes('/menu/')) {
    return { width: 600, quality: 78, outputFormat: 'webp' };
  }
  if (rel.includes('logo')) {
    return { width: 400, quality: 82, outputFormat: 'webp' };
  }
  // Gallery and hero images
  return { width: 1600, quality: 75, outputFormat: 'webp' };
}

async function optimizeFile(filePath) {
  const before = await getFileSize(filePath);
  const { width, quality, outputFormat } = getConfig(filePath);

  try {
    const img = sharp(filePath).rotate(); // auto-rotate from EXIF
    const meta = await img.metadata();

    // Skip if already small enough (under 120KB for small images, 400KB for large)
    const isSmall = filePath.includes('/avatars/') || filePath.includes('/menu/');
    const skipThreshold = isSmall ? 120_000 : 400_000;
    if (before < skipThreshold) {
      console.log(`  ⏭  SKIP  ${path.relative(ROOT, filePath)} (${(before/1024).toFixed(0)}KB — already small)`);
      return;
    }

    // Only downscale, never upscale
    const targetWidth = meta.width && meta.width < width ? meta.width : width;

    await img
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toFile(filePath + '.tmp');

    // Replace original with optimized version
    const { rename } = await import('fs/promises');
    await rename(filePath + '.tmp', filePath);

    const after = await getFileSize(filePath);
    const saving = ((before - after) / before * 100).toFixed(1);
    console.log(`  ✅ ${path.relative(ROOT, filePath)}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${saving}%)`);
  } catch (err) {
    console.error(`  ❌ Error processing ${filePath}: ${err.message}`);
    // Clean up temp file if it exists
    try {
      const { unlink } = await import('fs/promises');
      await unlink(filePath + '.tmp');
    } catch {}
  }
}

async function main() {
  console.log('🖼  Scanning images in public/...\n');
  const files = await getAllFiles(ROOT);
  console.log(`Found ${files.length} image files\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const before = await getFileSize(file);
    totalBefore += before;
    await optimizeFile(file);
    const after = await getFileSize(file);
    totalAfter += after;
  }

  console.log(`\n📊 Total: ${(totalBefore/1024/1024).toFixed(1)}MB → ${(totalAfter/1024/1024).toFixed(1)}MB`);
  console.log(`💾 Saved: ${((totalBefore-totalAfter)/1024/1024).toFixed(1)}MB (${((totalBefore-totalAfter)/totalBefore*100).toFixed(1)}%)`);
}

main().catch(console.error);
