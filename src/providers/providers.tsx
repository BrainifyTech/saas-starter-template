"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { capabilityMode, env } from "@/env";
import { RootProvider } from "fumadocs-ui/provider";

// Analytics is not one of the declared capabilities; in mock mode it is off,
// so a preview does not send page views to a stand-in host.
if (typeof window !== "undefined" && capabilityMode === "live") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
  });
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{
        enabled: true,
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PostHogProvider client={posthog}>{children}</PostHogProvider>
      </ThemeProvider>
    </RootProvider>
  );
}
