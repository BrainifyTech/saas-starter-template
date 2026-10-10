"use client";

import Container from "@/components/container";
import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { applicationName } from "@/app-config";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I join a group?",
      answer:
        "Simply browse our groups page, find a community that interests you, and click 'Join Group'. Most groups are open to everyone, though some may require approval from the group admin.",
    },
    {
      question: `Is ${applicationName} free to use?`,
      answer:
        "Yes! We offer a free Starter plan that lets you join unlimited groups and create up to 3 groups of your own. If you want to create more groups or access advanced features, we offer affordable paid plans.",
    },
    {
      question: "Can I make my group private?",
      answer:
        "Yes! With our Community Leader and Pro plans, you can create private groups that require approval to join. This is perfect for exclusive communities, clubs, or organizations.",
    },
    {
      question: "How do I organize events?",
      answer:
        "In your group dashboard, click 'Create Event' to schedule a meetup. Add details like date, time, location, and description. Members can RSVP, and you'll be able to see who's attending.",
    },
  ];

  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-900/30">
      <Container>
        <div className="flex flex-col md:flex-row gap-16">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              Can't find what you're looking for? <br/>
              <a href="/contact" className="text-brand-primary font-medium hover:underline">Contact our support team.</a>
            </p>
          </div>

          <div className="md:w-2/3 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                  >
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {faq.question}
                    </span>
                    <Plus className={cn("w-5 h-5 text-neutral-400 transition-transform duration-200", isOpen && "rotate-45")} />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="px-6 pb-6 pt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
