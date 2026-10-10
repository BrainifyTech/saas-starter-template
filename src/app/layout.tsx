import "@/app/globals.css";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ReactNode, Suspense } from "react";
import { Providers } from "@/providers/providers";
import { applicationName, appConfig } from "@/app-config";
import { env } from "@/env";
import PostHogPageView from "@/components/posthog-page-view";

import { Archivo } from "next/font/google";
import { Libre_Franklin } from "next/font/google";
import { BreakpointOverlay } from "@/components/breakpoint-overlay";
import { brandCss } from "@/brand";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});
const libre_franklin = Libre_Franklin({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-libre_franklin",
});

const { mode } = appConfig;

export const metadata: Metadata = {
  title: applicationName,
  icons: [
    { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon.ico" },
  ],
  description:
    `Connect with like-minded people, join groups, and organize events. ${applicationName} makes it easy to build and grow your community.`,
  openGraph:
    mode === "comingSoon"
      ? {
          title: applicationName,
          description:
            "The easiest way to find your tribe and build meaningful connections.",
          // The deployment's own address; the starter named its own domain
          // and an og-image that was never in public/.
          url: env.HOST_NAME,
          siteName: applicationName,
          type: "website",
        }
      : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The brand's primary colour, light and dark, over globals.css. */}
        <style dangerouslySetInnerHTML={{ __html: brandCss() }} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          archivo.variable + " " + libre_franklin.variable
        )}
      >
        <Providers>
          <Suspense>
            <PostHogPageView />
          </Suspense>
          <NextTopLoader />
          <div>{children}</div>
        </Providers>
        <Toaster />
        <BreakpointOverlay />
      </body>
    </html>
  );
}
