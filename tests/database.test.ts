// Against the real database (DATABASE_URL, migrated by `npm test` first): a
// record saved is found again, and the fake checkout makes a user premium the
// way a Stripe webhook would. This is the test that needs the `database`
// capability; it fails, loudly, without one.

import { after, test } from "node:test";
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { database, pg } from "@/db";
import { users } from "@/db/schema";
import { fakeSubscription } from "@/capabilities/payments";
import { createSubscriptionUseCase, getUserPlanUseCase } from "@/use-cases/subscriptions";

after(async () => {
  await pg.end();
});

test("a record saved is found again", async () => {
  const email = `round-trip-${Date.now()}@example.test`;
  const [created] = await database.insert(users).values({ email }).returning();
  try {
    const found = await database.query.users.findFirst({ where: eq(users.email, email) });
    assert.equal(found?.id, created.id);
  } finally {
    await database.delete(users).where(eq(users.id, created.id));
  }
});

test("the fake checkout makes a user premium", async () => {
  const email = `checkout-${Date.now()}@example.test`;
  const [user] = await database.insert(users).values({ email }).returning();
  try {
    assert.equal(await getUserPlanUseCase(user.id), "free");
    await createSubscriptionUseCase(fakeSubscription(user.id, "price_mock_premium"));
    assert.equal(await getUserPlanUseCase(user.id), "premium");
  } finally {
    await database.delete(users).where(eq(users.id, user.id));
  }
});
