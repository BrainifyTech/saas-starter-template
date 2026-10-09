// "A record saved and found again", through the starter's own data-access
// functions. RapidBuild's saas-starter preset runs it as its test command,
// after migrate and seed:
//
//   npm run db:migrate && npm run db:seed && npx tsx rb-db-smoke.ts
//
// Inside a RapidBuild run, DATABASE_URL is the run's embedded Postgres 16, and
// this script is how GF-16 proved that database works (gf-16-embedded-db.md).
// `npm run test` runs the same three steps first and then the rest of the
// suite, so both mean the same thing in a run, in CI and locally. It exits
// non-zero when anything saved is not found again, or when there is no
// database.
import "dotenv/config";
import { createUser, deleteUser, getUserByEmail } from "@/data-access/users";
import { createGroup, getGroupsByUser } from "@/data-access/groups";
import { pg } from "@/db";

async function main() {
  const email = `rb-smoke-${Date.now()}@example.com`;
  const created = await createUser(email);
  try {
    const found = await getUserByEmail(email);
    if (!found || found.id !== created.id) {
      throw new Error(`user ${email} was saved but not found again`);
    }
    await createGroup({ name: "RB smoke", description: "saved and found", isPublic: false, userId: created.id });
    const groups = await getGroupsByUser(created.id);
    if (groups.length !== 1 || groups[0].name !== "RB smoke") {
      throw new Error("group was saved but not found again");
    }
    const [{ version }] = await pg`select version() as version`;
    console.log(
      `saved user ${created.id} <${email}> and found it again; group ${groups[0].id} found again; server: ${version}`
    );
  } finally {
    await deleteUser(created.id);
  }
  await pg.end();
}

main().catch(async (err) => {
  console.error(err);
  await pg.end().catch(() => {});
  process.exit(1);
});
