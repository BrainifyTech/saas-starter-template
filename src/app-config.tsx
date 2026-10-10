import { brand } from "@/brand";

export const appConfig: {
  mode: "comingSoon" | "maintenance" | "live";
} = {
  mode: "live",
};

export const protectedRoutes = ["/purchases", "/dashboard"];
// The name comes from the brand tokens (brand/brand.json), the one place a
// product sets it.
export const applicationName = brand.productName;
// The brand sheet has exactly four slots (product name, logo, colour, tone),
// so the product's name stands in for the company's wherever a page names
// who runs it (the legal pages). The starter hard-coded its own company
// here, and every footer credited it; RapidBuild's scaffold story parked the
// footer as a company credit no brand slot reaches (the GF-24 walk, F10).
export const companyName = brand.productName;

export const MAX_UPLOAD_IMAGE_SIZE_IN_MB = 5;
export const MAX_UPLOAD_IMAGE_SIZE = 1024 * 1024 * MAX_UPLOAD_IMAGE_SIZE_IN_MB;

export const TOKEN_LENGTH = 32;
export const TOKEN_TTL = 1000 * 60 * 5; // 5 min
export const VERIFY_EMAIL_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

export const MAX_GROUP_LIMIT = 10;
export const MAX_GROUP_PREMIUM_LIMIT = 50;

export const afterLoginUrl = "/dashboard";
