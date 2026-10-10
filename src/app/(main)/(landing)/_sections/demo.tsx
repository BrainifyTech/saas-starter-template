import Container from "@/components/container";
import { applicationName } from "@/app-config";
import { env } from "@/env";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DemoSection() {
  return (
    <section className="py-24 bg-neutral-900 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/20 rounded-full blur-[120px]" />
      
      <Container className="relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Experience the Platform
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Take a quick tour of the features that make {applicationName} the best place to build communities.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-white/10 bg-neutral-950/50 backdrop-blur shadow-2xl overflow-hidden">
            {/* Browser Chrome */}
            <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-block px-3 py-1 rounded-md bg-black/20 text-xs text-neutral-400 font-mono">
                  {new URL(env.HOST_NAME).host}/demo
                </div>
              </div>
              <div className="w-12" /> {/* Spacer for balance */}
            </div>

            {/* Video Area */}
            <div className="aspect-video bg-neutral-900 relative group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white fill-white translate-x-1" />
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-lg">Platform Walkthrough</p>
                <p className="text-sm text-neutral-300">2:45 • 4K Resolution</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-neutral-900 hover:bg-neutral-100 transition-all" asChild>
            <Link href="/sign-in">Start Your Free Trial</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
