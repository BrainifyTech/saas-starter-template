import { env } from "@/env";
import { storageAdapter } from "@/capabilities";
import {
  mockObjectUrl,
  putMockObject,
} from "@/capabilities/storage";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

export async function getDownloadUrl(objectName: string) {
  if (storageAdapter() === "local") return mockObjectUrl(objectName);
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
      Key: objectName,
    }),
    { expiresIn: 3600 }
  );
}

export async function uploadFileToBucket(file: File, filename: string) {
  if (storageAdapter() === "local") {
    await putMockObject(
      filename,
      new Uint8Array(await file.arrayBuffer()),
      file.type
    );
    return;
  }
  const Key = filename;
  const Bucket = env.CLOUDFLARE_BUCKET_NAME;

  let res;

  try {
    const parallelUploads = new Upload({
      client: s3Client,
      params: {
        Bucket,
        Key,
        Body: file.stream(),
        ACL: "public-read",
        ContentType: file.type,
      },
      queueSize: 4,
      leavePartsOnError: false,
    });

    res = await parallelUploads.done();
  } catch (e) {
    throw e;
  }

  return res;
}

export async function getPresignedPostUrl(
  objectName: string,
  contentType: string
) {
  if (storageAdapter() === "local") {
    // Nothing in the app calls this today; a browser-direct upload needs a
    // bucket that signs requests, which local disk cannot.
    throw new Error("direct uploads need the live storage adapter (r2)");
  }
  return await createPresignedPost(s3Client, {
    Bucket: env.CLOUDFLARE_BUCKET_NAME,
    Key: objectName,
    // Conditions: [
    //   ["content-length-range", 0, 1024 * 1024 * 2],
    //   ["starts-with", "$Content-Type", contentType],
    // ],
    Expires: 600, // 10 minutes
    // Fields: {
    //   // acl: "public-read",
    //   "Content-Type": contentType,
    // },
  });
}

export async function getFileUrl({ key }: { key: string }) {
  if (storageAdapter() === "local") return mockObjectUrl(key);
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: 3600 }
  );
  return url;
}
