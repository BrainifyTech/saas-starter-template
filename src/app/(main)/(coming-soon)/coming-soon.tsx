import { ComingSoonHeader } from "@/app/(main)/(coming-soon)/header";
import { NewsletterForm } from "@/app/(main)/(coming-soon)/newsletter-form";
import Image from "next/image";
import { applicationName } from "@/app-config";

export function Lines() {
  return (
    <svg
      className="absolute inset-0 z-10 h-full w-full stroke-neutral-200 dark:stroke-neutral-800"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
          width="230"
          height="230"
          x="50%"
          y="-1"
          patternUnits="userSpaceOnUse"
        >
          <path d="M.5 230V.5H230" fill="none"></path>
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth="0"
        fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)"
      ></rect>
    </svg>
  );
}

export function ComingSoon() {
  return (
    <>
      <section className="relative pt-12 min-h-screen gap-8 bg-gradient-to-b dark:from-neutral-900 dark:to-neutral-800 from-green-200 to-blue-100 shadow-md">
        <Lines />

        <ComingSoonHeader />

        <div className="relative z-20 container mx-auto flex flex-col justify-center">
          <div className="grid max-w-screen-xl px-4 pt-12 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-24 lg:grid-cols-12 lg:pt-16">
            <div className="mr-auto place-self-center col-span-7">
              <h1 className="font-semibold max-w-2xl mb-6 text-4xl leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
                <span className="text-brand-primary">{applicationName}</span> is
                coming soon.
              </h1>

              <p className="text-3xl mb-4">Get notified when we launch</p>

              <NewsletterForm />
            </div>

            <div className="col-span-1"></div>

            <div className="w-full col-span-4">
              <Image
                className="rounded-xl w-full shadow-xl hidden lg:block"
                width="300"
                height="200"
                src="/group.jpeg"
                alt="hero image"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
