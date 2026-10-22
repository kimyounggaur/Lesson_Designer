#!/usr/bin/env node
/**
 * design/icons-src/<id>.(png|jpg|jpeg) → public/icons/<id>.webp (256×256, 투명 배경, contain)
 *
 *   npm run icons:build                       # 전체 (webp 만 — 모든 사용처가 next/image 를 거치므로 폴백 불필요)
 *   node scripts/optimize-icons.mjs kalimba   # 일부만
 *   node scripts/optimize-icons.mjs --png     # png 폴백도 함께 생성
 *
 * JPEG 원본(불투명 배경)은 투명 처리가 불가능하므로 그대로 contain 으로 맞춘다. 가능하면 배경이 제거된 PNG 를 원본으로 둘 것.
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("design/icons-src");
const OUT = path.resolve("public/icons");
const SIZE = 256;
const args = process.argv.slice(2);
const withPng = args.includes("--png");
const only = new Set(args.filter((arg) => !arg.startsWith("--")));

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  if (files.length === 0) {
    console.error(`원본 아이콘이 없습니다: ${SRC}`);
    process.exit(1);
  }

  const rows = [];
  for (const file of files) {
    const id = file.replace(/\.(png|jpe?g)$/i, "");
    if (only.size > 0 && !only.has(id)) continue;

    const input = path.join(SRC, file);
    const base = sharp(input).resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });

    const webpPath = path.join(OUT, `${id}.webp`);
    await base.clone().webp({ quality: 88, effort: 6 }).toFile(webpPath);
    const row = { id, webpKB: ((await stat(webpPath)).size / 1024).toFixed(1) };

    if (withPng) {
      const pngPath = path.join(OUT, `${id}.png`);
      await base.clone().png({ compressionLevel: 9, palette: true }).toFile(pngPath);
      row.pngKB = ((await stat(pngPath)).size / 1024).toFixed(1);
    }

    rows.push(row);
  }

  console.table(rows);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
