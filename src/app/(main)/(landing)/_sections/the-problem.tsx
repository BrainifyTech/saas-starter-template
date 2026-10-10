import Container from "@/components/container";
import { applicationName } from "@/app-config";
import { Heart, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TheProblemSection() {
  const problems = [
    {
      icon: Heart,
      title: "Feeling Isolated?",
      description: "Finding people who truly share your specific interests can feel impossible in a crowded digital world.",
      highlight: "text-status-error",
      bg: "bg-status-error/10",
      border: "border-status-error/20"
    },
    {
      icon: MessageSquare,
      title: "Too Much Noise",
      description: "Traditional social media is cluttered with ads and algorithms that keep you scrolling, not connecting.",
      highlight: "text-status-warning",
      bg: "bg-status-warning/10",
      border: "border-status-warning/20"
    },
    {
      icon: Calendar,
      title: "Planning Nightmares",
      description: "Organizing simple meetups involves endless group chats, lost details, and flaky RSVPs.",
      highlight: "text-status-info",
      bg: "bg-status-info/10",
      border: "border-status-info/20"
    },
  ];

  return (
    <section className="py-24 relative bg-background">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6">
              Building Community <br/>
              <span className="text-neutral-400">Shouldn't Be Hard.</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
              We've all been there. You want to connect, but the tools get in the way. 
              {applicationName} strips away the noise and gives you the dedicated space you need.
            </p>
            <div className="h-1 w-20 bg-brand-primary rounded-full mb-12" />
            
            <div className="space-y-6">
              {problems.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors", item.bg, item.highlight)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-brand-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-3xl blur-3xl" />
            <Card className="relative bg-card/50 backdrop-blur-xl border-neutral-200 dark:border-neutral-800 shadow-2xl p-8 rounded-3xl">
              <CardContent className="p-0 space-y-8">
                <div className="space-y-4">
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full w-3/4" />
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/2" />
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full w-full" />
                </div>
                
                <div className="p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
                  <p className="text-brand-primary font-medium text-center text-lg">
                    "Finally, a place where I can actually find my tribe."
                  </p>
                </div>

                <div className="flex justify-center">
                   <div className="px-6 py-3 rounded-full bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 font-semibold shadow-lg flex items-center gap-2">
                     The {applicationName} Way <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
