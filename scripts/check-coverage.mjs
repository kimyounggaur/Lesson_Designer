#!/usr/bin/env node
/**
 * Phase 6 Step 6.5 — 커버리지 문턱 검사.
 *
 * `vitest run --coverage --coverage.reporter=json-summary` 가 남긴 coverage/coverage-summary.json 을 읽어
 * 위험 영역(src/features, src/app/auth, src/app/go)의 라인 커버리지가 85% 미만이면 실패한다.
 * 그룹 단위로 합산(covered/total)하며, 그룹에 측정된 파일이 하나도 없어도 실패한다(패턴이 깨진 것이므로).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const THRESHOLD = Number(process.env.COVERAGE_MIN ?? 85);
const GROUPS = ["src/features/", "src/app/auth/", "src/app/go/"];
const summaryPath = path.resolve(process.cwd(), "coverage/coverage-summary.json");

let summary;
try {
  summary = JSON.parse(readFileSync(summaryPath, "utf8"));
} catch (error) {
  console.error(`coverage summary 를 읽지 못했습니다: ${summaryPath}`);
  console.error("먼저 `npm run test -- --coverage --coverage.reporter=json-summary` 를 실행하세요.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(2);
}

const toRelative = (file) =>
  path.relative(process.cwd(), path.resolve(process.cwd(), file)).split(path.sep).join("/");

const files = Object.entries(summary)
  .filter(([key]) => key !== "total")
  .map(([key, value]) => ({ file: toRelative(key), lines: value.lines }));

let failed = false;
const rows = [];

for (const group of GROUPS) {
  const members = files.filter(({ file }) => file.startsWith(group));
  const covered = members.reduce((sum, { lines }) => sum + lines.covered, 0);
  const total = members.reduce((sum, { lines }) => sum + lines.total, 0);
  const pct = total === 0 ? 0 : (covered / total) * 100;
  const ok = members.length > 0 && pct >= THRESHOLD;

  if (!ok) {
    failed = true;
  }

  rows.push({
    group,
    files: members.length,
    lines: `${covered}/${total}`,
    pct: `${pct.toFixed(2)}%`,
    ok: ok ? "✓" : "✗"
  });

  for (const { file, lines } of members) {
    if (lines.total > 0 && lines.pct < THRESHOLD) {
      rows.push({
        group: `  ${file}`,
        files: "",
        lines: `${lines.covered}/${lines.total}`,
        pct: `${lines.pct}%`,
        ok: ""
      });
    }
  }
}

console.table(rows);

if (failed) {
  console.error(`라인 커버리지 문턱(${THRESHOLD}%) 미달 그룹이 있습니다.`);
  process.exit(1);
}

console.log(`모든 그룹이 라인 커버리지 ${THRESHOLD}% 이상입니다.`);
