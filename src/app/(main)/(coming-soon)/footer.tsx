import { Lines } from "@/app/(main)/(coming-soon)/coming-soon";
import Link from "next/link";

export function ComingSoonFooter() {
  return (
    <section className="relative py-12">
      {/* Light mode background */}
      <div 
        className="absolute inset-0 dark:hidden"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--status-success-light)), hsl(var(--status-info-light)))`,
        }}
      />
      {/* Dark mode background */}
      <div 
        className="hidden dark:block absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, hsl(var(--neutral-950)), hsl(var(--neutral-800)))`,
        }}
      />
      <Lines />

      <div className="z-20 relative flex flex-col items-center gap-8">
        <div className="flex gap-8">
          <Link href="/privacy" className="hover:underline text-neutral-900 dark:text-neutral-100">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline text-neutral-900 dark:text-neutral-100">
            Terms of Service
          </Link>
        </div>
      </div>
    </section>
  );
}
