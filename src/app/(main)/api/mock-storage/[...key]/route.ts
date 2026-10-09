import { isMock } from "@/capabilities";
import { readMockObject } from "@/capabilities/storage";

// Serves files the storage mock wrote to local disk. In live mode files are
// served by the bucket, so this route does not exist.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
): Promise<Response> {
  if (!isMock()) return new Response("Not found", { status: 404 });
  const { key } = await params;
  let object;
  try {
    object = await readMockObject(key.map(decodeURIComponent).join("/"));
  } catch {
    return new Response("Bad key", { status: 400 });
  }
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "Content-Type": object.contentType,
      "Cache-Control": "no-store",
    },
  });
}
