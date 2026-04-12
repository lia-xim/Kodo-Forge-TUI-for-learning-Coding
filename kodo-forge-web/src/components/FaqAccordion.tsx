"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="border border-amber-500/20 bg-[#141416] transition-colors hover:border-amber-500/40"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-trigger-${i}`}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
            >
              <span className="font-mono text-sm font-medium text-zinc-100">
                <span className="mr-3 text-amber-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.question}
              </span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={`flex-shrink-0 text-amber-500/70 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-trigger-${i}`}
                className="border-t border-amber-500/15 px-5 py-4 font-sans text-sm leading-relaxed text-zinc-400"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
