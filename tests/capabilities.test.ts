// The local mocks the template runs on by default. Each test exercises the
// mock itself, not a stand-in for it, so a mock that stops working fails here
// before it fails in a preview.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), "mock-storage-"));
process.env.MOCK_STORAGE_DIR = storageDir;
// The sender is asserted on its default, the brand name and the stand-in address.
delete process.env.EMAIL_FROM;

test("the declared set is exactly auth, email, storage, jobs, payments", async () => {
  const { CAPABILITY_NAMES, capabilities } = await import("@/capabilities");
  assert.deepEqual([...CAPABILITY_NAMES].sort(), ["auth", "email", "jobs", "payments", "storage"]);
  for (const name of CAPABILITY_NAMES) {
    assert.equal(capabilities[name].name, name);
    assert.ok(capabilities[name].adapter, `${name} names its adapter`);
    assert.ok(capabilities[name].mock, `${name} names its mock`);
  }
  assert.ok(!("database" in capabilities), "database is real Postgres, never a mock");
});

test("tests run in mock mode, so no provider is ever contacted", async () => {
  const { isMock, implementationOf } = await import("@/capabilities");
  assert.equal(isMock(), true);
  assert.equal(implementationOf("email"), "log");
  assert.equal(implementationOf("storage"), "local");
  assert.equal(implementationOf("payments"), "fake");
  assert.equal(implementationOf("auth"), "session-password");
});

test("email: a logged message lands in the outbox", async () => {
  const { sendLoggedEmail, mockOutbox, clearMockOutbox } = await import("@/capabilities/email");
  clearMockOutbox();
  await sendLoggedEmail({ to: "someone@example.test", subject: "Your sign-in link", html: "<a href='/x'>Sign in</a>" });
  assert.equal(mockOutbox().length, 1);
  assert.equal(mockOutbox()[0].to, "someone@example.test");
  assert.match(mockOutbox()[0].html, /Sign in/);
  const { brand } = await import("@/brand");
  assert.equal(mockOutbox()[0].from, `${brand.productName} <hello@example.test>`);
});

test("storage: a file put is read back, and a key cannot leave the directory", async () => {
  const { putMockObject, readMockObject, mockObjectUrl, mockPathFor } = await import("@/capabilities/storage");
  await putMockObject("groups/7-image", new TextEncoder().encode("png-bytes"), "image/png");
  const got = await readMockObject("groups/7-image");
  assert.ok(got);
  assert.equal(new TextDecoder().decode(got.body), "png-bytes");
  assert.equal(got.contentType, "image/png");
  assert.equal(mockObjectUrl("groups/7-image"), "/api/mock-storage/groups/7-image");
  assert.equal(await readMockObject("groups/missing"), null);
  assert.throws(() => mockPathFor("../escape"));
  assert.ok(fs.existsSync(path.join(storageDir, "groups", "7-image")));
});

test("payments: fake builds the record the webhook would write", async () => {
  const { fakeSubscription } = await import("@/capabilities/payments");
  const now = new Date("2026-01-01T00:00:00Z");
  const sub = fakeSubscription(42, "price_mock_premium", now);
  assert.equal(sub.userId, 42);
  assert.equal(sub.stripePriceId, "price_mock_premium");
  assert.match(sub.stripeSubscriptionId, /^sub_mock_42_/);
  assert.equal(sub.stripeCurrentPeriodEnd.getTime() - now.getTime(), 30 * 24 * 60 * 60 * 1000);
});

test("auth: OAuth is unavailable in mock mode and sends the person to email sign-in", async () => {
  const { oauthAvailable, oauthUnavailableResponse } = await import("@/capabilities/auth");
  assert.equal(oauthAvailable(), false);
  const res = oauthUnavailableResponse();
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("Location"), "/sign-in/email");
});
