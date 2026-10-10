// The two-heads check (scripts/check-migration-heads.mjs) on this repository's
// migrations, and on a fork built the way two branches would build one.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function load() {
  return (await import("../scripts/check-migration-heads.mjs")) as {
    checkMigrations: (dir: string) => { problems: string[]; head: string | null; count: number };
  };
}

test("this repository's migrations are one straight line", async () => {
  const { checkMigrations } = await load();
  const { problems, count } = checkMigrations("drizzle");
  assert.deepEqual(problems, []);
  assert.ok(count >= 4);
});

function copyMigrations(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "migrations-"));
  fs.cpSync("drizzle", dir, { recursive: true });
  return dir;
}

function addMigration(dir: string, tag: string, id: string, prevId: string, when: number) {
  const meta = path.join(dir, "meta");
  const parent = fs.readdirSync(meta).find((f) => {
    if (!f.endsWith("_snapshot.json")) return false;
    return JSON.parse(fs.readFileSync(path.join(meta, f), "utf8")).id === prevId;
  });
  assert.ok(parent, "parent snapshot exists");
  const snap = JSON.parse(fs.readFileSync(path.join(meta, parent), "utf8"));
  snap.id = id;
  snap.prevId = prevId;
  fs.writeFileSync(path.join(meta, `${tag.split("_")[0]}_snapshot.json`), JSON.stringify(snap));
  const journalPath = path.join(meta, "_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
  journal.entries.push({ idx: journal.entries.length, version: "7", when, tag, breakpoints: true });
  fs.writeFileSync(journalPath, JSON.stringify(journal));
  fs.writeFileSync(path.join(dir, `${tag}.sql`), "select 1;");
}

// A fixture goes on top of whatever the repository's head is, read from the
// journal, never from a constant. The first product story to add a migration
// (Tallyroom's TAL-6, 2026-10-10) generated one later than the fixture's old
// constant stamp of 2026-10-09 12:00, so the straight-line check refused the
// fixture as "not later than the one before it" and `npm test` was red on every
// product that had added a migration (GF-37 walk A5).
function afterHead(dir: string, seconds: number): { prefix: string; when: number } {
  const journal = JSON.parse(fs.readFileSync(path.join(dir, "meta", "_journal.json"), "utf8"));
  const last = journal.entries[journal.entries.length - 1];
  const when = last.when + seconds * 1000;
  const d = new Date(when);
  const two = (n: number) => String(n).padStart(2, "0");
  const prefix =
    `${d.getUTCFullYear()}${two(d.getUTCMonth() + 1)}${two(d.getUTCDate())}` +
    `${two(d.getUTCHours())}${two(d.getUTCMinutes())}${two(d.getUTCSeconds())}`;
  return { prefix, when };
}

function headId(dir: string): string {
  const journal = JSON.parse(fs.readFileSync(path.join(dir, "meta", "_journal.json"), "utf8"));
  const last = journal.entries[journal.entries.length - 1].tag.split("_")[0];
  return JSON.parse(fs.readFileSync(path.join(dir, "meta", `${last}_snapshot.json`), "utf8")).id;
}

test("one timestamped migration on top is accepted", async () => {
  const { checkMigrations } = await load();
  const dir = copyMigrations();
  const pins = afterHead(dir, 1);
  addMigration(dir, `${pins.prefix}_add_pins`, "aaaaaaaa-0000-0000-0000-000000000001", headId(dir), pins.when);
  assert.deepEqual(checkMigrations(dir).problems, []);
});

test("two migrations generated from the same parent are refused as two heads", async () => {
  const { checkMigrations } = await load();
  const dir = copyMigrations();
  const parent = headId(dir);
  const a = afterHead(dir, 1);
  addMigration(dir, `${a.prefix}_story_a`, "aaaaaaaa-0000-0000-0000-000000000001", parent, a.when);
  const b = afterHead(dir, 1); // one second after story_a, which the journal now ends at
  addMigration(dir, `${b.prefix}_story_b`, "bbbbbbbb-0000-0000-0000-000000000002", parent, b.when);
  const { problems } = checkMigrations(dir);
  assert.ok(problems.some((p) => p.startsWith("two heads")), problems.join("\n"));
});

test("a new sequence-numbered migration is refused", async () => {
  const { checkMigrations } = await load();
  const dir = copyMigrations();
  addMigration(dir, "0004_next_one", "cccccccc-0000-0000-0000-000000000003", headId(dir), afterHead(dir, 1).when);
  const { problems } = checkMigrations(dir);
  assert.ok(problems.some((p) => p.includes("not timestamp-prefixed")), problems.join("\n"));
});

test("a SQL file the journal does not list is refused", async () => {
  const { checkMigrations } = await load();
  const dir = copyMigrations();
  fs.writeFileSync(path.join(dir, `${afterHead(dir, 1).prefix}_orphan.sql`), "select 1;");
  const { problems } = checkMigrations(dir);
  assert.ok(problems.some((p) => p.includes("not listed in the journal")), problems.join("\n"));
});
