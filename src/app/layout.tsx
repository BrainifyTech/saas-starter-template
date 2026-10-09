import "@/app/globals.css";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ReactNode, Suspense } from "react";
import { Providers } from "@/providers/providers";
import { applicationName, appConfig } from "@/app-config";
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
  keywords:
    "community platform, group finder, meetup organizer, social groups, hobby groups, event scheduling, community building, find friends, interest groups, local communities, online communities, group chat, member management, private groups",
  description:
    "Connect with like-minded people, join groups, and organize events. Group Finder makes it easy to build and grow your community.",
  openGraph:
    mode === "comingSoon"
      ? {
          title: "Group Finder - Build Your Community",
          description:
            "The easiest way to find your tribe and build meaningful connections.",
          url: "https://groupfinder.app",
          siteName: "Group Finder",
          type: "website",
          images: [
            {
              url: "https://groupfinder.app/og-image.png",
              secureUrl: "https://groupfinder.app/og-image.png",
              width: 1200,
              height: 630,
              alt: "Group Finder - Find Your People",
            },
          ],
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
