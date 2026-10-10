import { expect, test } from "@playwright/test";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { pg, database } from "@/db";
import { sessions } from "@/db/schema";
import { createUser, deleteUser } from "@/data-access/users";

// What a signed-in page answers, as HTTP, with no browser: a visitor nobody
// signed in is sent to sign-in, a signed-in one gets the page, and a URL
// nothing serves is still a 404. The last one is what keeps "the page does
// not exist yet" and "the page is behind sign-in" apart from outside, which
// is how RapidBuild proves a new signed-in screen (GF-37 walk, A7); the check
// lives in each page for that reason (src/lib/session.ts). Redirects are not
// followed: the 307 and its Location are the answer.

test("a visitor nobody signed in is sent to sign-in from a signed-in page", async ({ request }) => {
  const res = await request.get("/dashboard", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toBe("/sign-in");
});

test("a URL under /dashboard that nothing serves is a 404, not a sign-in redirect", async ({ request }) => {
  const res = await request.get("/dashboard/no-such-page", { maxRedirects: 0 });
  expect(res.status()).toBe(404);
});

test("the sign-in page itself opens for that visitor", async ({ request }) => {
  const res = await request.get("/sign-in", { maxRedirects: 0 });
  expect(res.status()).toBe(200);
});

test("a signed-in visitor gets the page", async ({ request }) => {
  // A session made the way src/auth.ts's createSession makes one (that
  // module is server-only): the cookie holds the token, the row its sha-256.
  const user = await createUser(`e2e-signed-in-${Date.now()}@example.com`);
  try {
    const token = encodeBase32LowerCaseNoPadding(crypto.getRandomValues(new Uint8Array(20)));
    await database.insert(sessions).values({
      id: encodeHexLowerCase(sha256(new TextEncoder().encode(token))),
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const res = await request.get("/dashboard", {
      maxRedirects: 0,
      headers: { cookie: `session=${token}` },
    });
    expect(res.status()).toBe(200);
  } finally {
    await deleteUser(user.id);
  }
});

test.afterAll(async () => {
  await pg.end();
});
