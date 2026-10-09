// storage: Cloudflare R2 live, local disk in mock mode.
//
// Mock files live under MOCK_STORAGE_DIR and are served back by
// /api/mock-storage/[...key], which answers 404 in live mode. Keys come from
// the app (`<groupId>-image`, profile image keys), never straight from a
// request, but the path check below holds even if one ever does.

import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/env";

function root(): string {
  return path.resolve(env.MOCK_STORAGE_DIR);
}

export function mockPathFor(key: string): string {
  const base = root();
  const full = path.resolve(base, key);
  if (!key || full === base || !full.startsWith(base + path.sep)) {
    throw new Error(`storage key ${JSON.stringify(key)} leaves the mock storage directory`);
  }
  return full;
}

export async function putMockObject(
  key: string,
  body: Uint8Array,
  contentType: string
): Promise<void> {
  const file = mockPathFor(key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body);
  await fs.writeFile(`${file}.content-type`, contentType);
}

export async function readMockObject(
  key: string
): Promise<{ body: Uint8Array; contentType: string } | null> {
  const file = mockPathFor(key);
  try {
    const [body, contentType] = await Promise.all([
      fs.readFile(file),
      fs.readFile(`${file}.content-type`, "utf8").catch(() => "application/octet-stream"),
    ]);
    return { body, contentType };
  } catch {
    return null;
  }
}

// A URL the browser can load. Relative on purpose: a preview is reached
// through a proxy origin the app does not know, and HOST_NAME would point the
// image at localhost.
export function mockObjectUrl(key: string): string {
  return `/api/mock-storage/${key.split("/").map(encodeURIComponent).join("/")}`;
}
