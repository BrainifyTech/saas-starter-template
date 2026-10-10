import type { MetadataRoute } from "next";
import { env } from "@/env";

// The deployment's own address. The starter shipped public/sitemap.xml listing
// its own domain, which every product built from it would have published.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: "", priority: 1 },
    { path: "/terms-of-service", priority: 0.8 },
    { path: "/privacy", priority: 0.4 },
  ].map(({ path, priority }) => ({
    url: `${env.HOST_NAME}${path}`,
    changeFrequency: "weekly",
    priority,
  }));
}
