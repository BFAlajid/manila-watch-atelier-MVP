// scripts/optimize-images.ts
//
// One-shot image optimization for the big hero PNGs. For each source PNG in
// src/assets/ larger than a threshold, produce three siblings:
//   - <name>.webp  (quality 80)
//   - <name>.avif  (quality 55)
//   - <name>.opt.png (1920px max width, compressed)
//
// The original PNG is left untouched (so existing figma:asset/* imports keep
// working). Hero.tsx references the new siblings directly.
//
// Usage:
//   npm run optimize:images
//
// Re-run whenever the source hero images change. The script is idempotent.

import { readdirSync, statSync, existsSync } from 'fs';
import { join, parse } from 'path';
import sharp from 'sharp';

const ASSETS_DIR = join(process.cwd(), 'src', 'assets');
const MAX_WIDTH = 1920;
// Only bother for images above this size — the 300-400kb thumbnails are fine as-is.
const SIZE_THRESHOLD_BYTES = 200_000; // 200 KB — includes smaller hero images for consistent picture sources

async function optimize(pngPath: string, name: string): Promise<void> {
  const base = parse(name).name;
  const webpOut = join(ASSETS_DIR, `${base}.webp`);
  const avifOut = join(ASSETS_DIR, `${base}.avif`);
  const optPngOut = join(ASSETS_DIR, `${base}.opt.png`);

  const input = sharp(pngPath).rotate();
  const meta = await input.metadata();
  const targetWidth = meta.width && meta.width > MAX_WIDTH ? MAX_WIDTH : undefined;

  // Each format gets its own fresh pipeline so we can tune per-format options.
  const base$ = () => sharp(pngPath).rotate().resize({ width: targetWidth, withoutEnlargement: true });

  await base$().webp({ quality: 80, effort: 4 }).toFile(webpOut);
  await base$().avif({ quality: 55, effort: 4 }).toFile(avifOut);
  await base$().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(optPngOut);

  const sizes = await Promise.all(
    [webpOut, avifOut, optPngOut].map(async (p) => ({
      path: p,
      kb: Math.round(statSync(p).size / 1024),
    }))
  );
  const originalKb = Math.round(statSync(pngPath).size / 1024);
  const biggest = Math.max(...sizes.map((s) => s.kb));
  const saving = Math.round(100 - (biggest / originalKb) * 100);

  console.log(
    `${name}  ${originalKb} KB → webp ${sizes[0].kb} / avif ${sizes[1].kb} / png ${sizes[2].kb} (best ~${saving}% reduction)`
  );
}

async function main() {
  if (!existsSync(ASSETS_DIR)) {
    console.error(`[optimize:images] ${ASSETS_DIR} does not exist.`);
    process.exit(1);
  }
  const pngs = readdirSync(ASSETS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.png') && !f.endsWith('.opt.png'))
    .map((name) => {
      const full = join(ASSETS_DIR, name);
      return { name, full, size: statSync(full).size };
    })
    .filter((f) => f.size >= SIZE_THRESHOLD_BYTES)
    .sort((a, b) => b.size - a.size);

  if (pngs.length === 0) {
    console.log(`[optimize:images] Nothing over ${SIZE_THRESHOLD_BYTES / 1000} KB in ${ASSETS_DIR}. Done.`);
    return;
  }

  console.log(`[optimize:images] Optimizing ${pngs.length} image(s) from ${ASSETS_DIR}`);
  for (const { full, name } of pngs) {
    try {
      await optimize(full, name);
    } catch (err: any) {
      console.error(`[optimize:images] Failed on ${name}:`, err?.message || err);
    }
  }
  console.log('[optimize:images] Done. Reference the .webp / .avif / .opt.png siblings from components.');
}

main();
