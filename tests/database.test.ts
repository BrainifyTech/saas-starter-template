// Against the real database in DATABASE_URL, which `npm test` has migrated
// and seeded first. This is the part of the test profile that needs the
// `database` capability (the embedded Postgres inside a RapidBuild run, the
// compose or CI Postgres elsewhere), and it fails loudly without one.
//
// "A record saved and found again" goes through the starter's own
// data-access functions, the same check RapidBuild's GF-16 proved the
// embedded database with, so `npm test` means one thing in a run and in CI.

import { after, test } from "node:test";
import assert from "node:assert/strict";
import { pg } from "@/db";
import { createUser, deleteUser, getUserByEmail } from "@/data-access/users";
import { createGroup, getGroupsByUser } from "@/data-access/groups";
import { fakeSubscription } from "@/capabilities/payments";
import { createSubscriptionUseCase, getUserPlanUseCase } from "@/use-cases/subscriptions";
import { enqueue, stopJobs, takeOne } from "@/capabilities/jobs";

after(async () => {
  await stopJobs();
  await pg.end();
});

test("the seed ran: the test user exists", async () => {
  assert.ok(await getUserByEmail("testing@example.com"));
});

test("a record saved is found again", async () => {
  const email = `round-trip-${Date.now()}@example.com`;
  const created = await createUser(email);
  try {
    const found = await getUserByEmail(email);
    assert.equal(found?.id, created.id);
    await createGroup({ name: "Saved and found", description: "round trip", isPublic: false, userId: created.id });
    const groups = await getGroupsByUser(created.id);
    assert.deepEqual(groups.map((g) => g.name), ["Saved and found"]);
  } finally {
    await deleteUser(created.id);
  }
});

test("payments fake makes a user premium the way the webhook would", async () => {
  const created = await createUser(`checkout-${Date.now()}@example.com`);
  try {
    assert.equal(await getUserPlanUseCase(created.id), "free");
    await createSubscriptionUseCase(fakeSubscription(created.id, "price_mock_premium"));
    assert.equal(await getUserPlanUseCase(created.id), "premium");
  } finally {
    await deleteUser(created.id);
  }
});

test("jobs: a queued job is kept in Postgres and taken back out", async () => {
  const name = `test-job-${Date.now()}`;
  const id = await enqueue(name, { hello: "world" });
  const job = await takeOne<{ hello: string }>(name);
  assert.equal(job?.id, id);
  assert.deepEqual(job?.data, { hello: "world" });
  assert.equal(await takeOne(name), null, "taken once");
});
