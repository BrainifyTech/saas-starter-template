#!/usr/bin/env node
// Refuses a Drizzle migration directory that is not one straight line.
//
// Why this exists: stories land one after another on one epic branch, and two
// branches that each generate a migration from the same parent merge without
// a textual conflict in the SQL files while leaving the schema history forked.
// Drizzle's migrator applies whatever the journal lists, so a fork shows up
// in production as a migration that ran against a schema it was not generated
// from. RapidBuild's own agency-maintenance branch became unmergeable over a
// migration-id clash; this is the check that makes that a red CI line instead.
//
// What counts as a head: every snapshot in `meta/` names its parent in
// `prevId`. A snapshot no other snapshot names as parent is a head. A healthy
// directory has exactly one root (parent all zeros) and exactly one head, and
// the journal lists every migration once, in order, ending at that head.
//
// Plain Node and no dependencies, so CI can run it before `npm ci`.
//
// Usage: node scripts/check-migration-heads.mjs [migrations-dir]   (default: drizzle)

import fs from "node:fs";
import path from "node:path";

const ZERO = "00000000-0000-0000-0000-000000000000";

// The starter shipped these four with sequence-number prefixes before this
// template switched Drizzle to timestamps. They are grandfathered by name;
// any new index-prefixed migration is refused, because a sequence number is
// the id two branches pick identically.
const LEGACY_INDEX_TAGS = new Set([
  "0000_cute_kree",
  "0001_last_the_fallen",
  "0002_minor_dragon_man",
  "0003_sad_shadow_king",
]);
const TIMESTAMP_TAG = /^\d{14}_[a-z0-9_]+$/;

export function checkMigrations(dir) {
  const problems = [];
  const metaDir = path.join(dir, "meta");
  const journalPath = path.join(metaDir, "_journal.json");
  if (!fs.existsSync(journalPath)) {
    return { problems: [`no journal at ${journalPath}`], head: null, count: 0 };
  }
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
  const entries = Array.isArray(journal.entries) ? journal.entries : [];

  // --- the journal: contiguous, unique, ordered, and every tag well-named.
  const tags = new Set();
  let lastWhen = -Infinity;
  let seenTimestamp = false;
  entries.forEach((e, i) => {
    if (e.idx !== i) problems.push(`journal entry ${i} has idx ${e.idx}`);
    if (tags.has(e.tag)) problems.push(`journal lists ${e.tag} twice`);
    tags.add(e.tag);
    if (!(e.when > lastWhen)) {
      problems.push(`journal entry ${e.tag} is not later than the one before it`);
    }
    lastWhen = e.when;
    if (TIMESTAMP_TAG.test(e.tag)) {
      seenTimestamp = true;
    } else if (LEGACY_INDEX_TAGS.has(e.tag)) {
      if (seenTimestamp) problems.push(`legacy migration ${e.tag} listed after a timestamped one`);
    } else {
      problems.push(
        `migration ${e.tag} is not timestamp-prefixed (drizzle.config.ts sets migrations.prefix = "timestamp")`
      );
    }
    if (!fs.existsSync(path.join(dir, `${e.tag}.sql`))) {
      problems.push(`journal lists ${e.tag} but ${e.tag}.sql does not exist`);
    }
  });

  // --- every SQL file is in the journal (a file the journal does not list is
  // a migration that will silently never run).
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".sql") && !tags.has(f.slice(0, -4))) {
      problems.push(`${f} is not listed in the journal`);
    }
  }

  // --- the snapshot graph.
  const snapshots = fs
    .readdirSync(metaDir)
    .filter((f) => f.endsWith("_snapshot.json"))
    .sort();
  const byId = new Map();
  const parentOf = new Map();
  for (const f of snapshots) {
    const s = JSON.parse(fs.readFileSync(path.join(metaDir, f), "utf8"));
    if (byId.has(s.id)) problems.push(`snapshot id ${s.id} appears in ${byId.get(s.id)} and ${f}`);
    byId.set(s.id, f);
    parentOf.set(s.id, s.prevId);
  }
  const named = new Set(parentOf.values());
  const roots = [...parentOf].filter(([, p]) => p === ZERO).map(([id]) => byId.get(id));
  const heads = [...parentOf.keys()].filter((id) => !named.has(id)).map((id) => byId.get(id));
  for (const [id, p] of parentOf) {
    if (p !== ZERO && !byId.has(p)) {
      problems.push(`${byId.get(id)} names parent ${p}, which no snapshot has`);
    }
  }
  const children = new Map();
  for (const [id, p] of parentOf) {
    children.set(p, [...(children.get(p) || []), byId.get(id)]);
  }
  for (const [p, kids] of children) {
    if (kids.length > 1) {
      problems.push(
        `two heads: ${kids.join(" and ")} were both generated from ${p === ZERO ? "an empty schema" : byId.get(p)}; ` +
          `regenerate the later one on top of the other`
      );
    }
  }
  if (snapshots.length && roots.length !== 1) problems.push(`expected one root snapshot, found ${roots.length}`);
  if (snapshots.length && heads.length !== 1) problems.push(`expected one head, found ${heads.length}: ${heads.join(", ")}`);
  if (snapshots.length !== entries.length) {
    problems.push(`${entries.length} journal entries but ${snapshots.length} snapshots`);
  }

  // --- the journal ends at the head: its last entry's snapshot is the tip.
  const last = entries[entries.length - 1];
  if (last && heads.length === 1) {
    const prefix = last.tag.split("_")[0];
    if (heads[0] !== `${prefix}_snapshot.json`) {
      problems.push(`the journal ends at ${last.tag} but the snapshot head is ${heads[0]}`);
    }
  }

  return { problems, head: heads.length === 1 ? heads[0] : null, count: entries.length };
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invokedDirectly) {
  const dir = process.argv[2] || "drizzle";
  const { problems, head, count } = checkMigrations(dir);
  if (problems.length) {
    console.error(`migrations:check refused ${dir}:`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`migrations:check ok: ${count} migrations, one head (${head})`);
}
