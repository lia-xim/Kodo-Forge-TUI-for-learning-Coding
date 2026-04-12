import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  Terminal,
  Zap,
  Download,
  BookOpen,
  Layers,
  Brain,
  Shield,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { courses } from "@/data/courses";
import FaqAccordion from "@/components/FaqAccordion";
import SectionHeader from "@/components/SectionHeader";

const featureIcons = [
  <Zap key="zap" size={24} aria-hidden="true" />,
  <BookOpen key="book" size={24} aria-hidden="true" />,
  <Brain key="brain" size={24} aria-hidden="true" />,
  <Shield key="shield" size={24} aria-hidden="true" />,
  <Layers key="layers" size={24} aria-hidden="true" />,
  <Sparkles key="sparkles" size={24} aria-hidden="true" />,
];

/** Status → [label, Tailwind color classes for the badge]. */
const COURSE_STATUS: Record<
  "active" | "planned",
  { label: string; classes: string }
> = {
  active: {
    label: "SHIPPING",
    classes: "text-[#33FF66]",
  },
  planned: {
    label: "IN DEV  ",
    classes: "text-zinc-500",
  },
};

/** Render a fixed-width field, padding with spaces on the right. */
function pad(value: string, width: number): string {
  if (value.length >= width) return value.slice(0, width);
  return value + " ".repeat(width - value.length);
}

interface HomePageProps {
  dict: Record<string, any>;
  lang: string;
}

export default function HomePage({ dict, lang }: HomePageProps) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((faq: any) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const faqItems = dict.faq.items.map((faq: any) => ({
    question: faq.q,
    answer: faq.a,
  }));

  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* CRT vignette + film-grain layers. The scanline .crt-overlay is
          rendered once by the locale layout; these two add depth on top of it. */}
      <div className="crt-vignette" aria-hidden="true" />
      <div className="crt-grain" aria-hidden="true" />

      <article className="relative font-mono">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative flex min-h-[90vh] items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/screenshots/kodo_screen_1.png"
              alt="Kodo Forge terminal learning platform running in a dark retro-futuristic environment"
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0d]/60 via-[#0b0b0d]/80 to-[#0b0b0d]" />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-2">
            <div className="anim-fade-up anim-delay-0">
              <div className="mb-6 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-500">
                <Terminal size={14} aria-hidden="true" />
                <span>{dict.hero.badge}</span>
              </div>

              {/* Full ASCII KODO logo — responsive monospace sizing. */}
              <pre
                aria-label="KODO"
                className="mb-6 select-none font-mono text-[0.5rem] leading-none text-amber-500 sm:text-xs"
              >
{`██╗  ██╗ ██████╗ ██████╗  ██████╗
██║ ██╔╝██╔═══██╗██╔══██╗██╔═══██╗
█████╔╝ ██║   ██║██║  ██║██║   ██║
██╔═██╗ ██║   ██║██║  ██║██║   ██║
██║  ██╗╚██████╔╝██████╔╝╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝`}
              </pre>

              <h1 className="mb-4 font-sans text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-50 sm:text-6xl">
                {dict.hero.title1}
                <br />
                <span className="text-amber-500">{dict.hero.title2}</span>
              </h1>

              {/* Secondary tagline in amber mono. */}
              {dict.hero.tagline && (
                <p className="mb-8 font-mono text-sm text-amber-500">
                  &gt; {dict.hero.tagline}
                </p>
              )}

              <p
                className="mb-10 max-w-lg border-l border-amber-500/30 pl-5 font-sans text-base leading-relaxed text-zinc-400"
                dangerouslySetInnerHTML={{ __html: dict.hero.description }}
              />

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/${lang}/download`}
                  className="inline-flex items-center justify-center gap-3 border border-amber-500/50 bg-[#141416] px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-amber-500 transition-all hover:-translate-y-0.5 hover:border-amber-500 hover:bg-[#1c1c20] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Download size={16} aria-hidden="true" />
                  {dict.hero.downloadBtn}
                </Link>
                <Link
                  href={`/${lang}/courses`}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {dict.hero.browseBtn}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Terminal mockup — flat, no blur, amber hairline. */}
            <div className="anim-fade-up anim-delay-200 hidden lg:block">
              <div className="border border-amber-500/25 bg-[#141416]">
                <div className="flex items-center gap-2 border-b border-amber-500/20 px-4 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-3 font-mono text-xs text-zinc-500">
                    {dict.hero.terminalTitle}
                  </span>
                </div>
                <div className="space-y-1 p-5 font-mono text-sm">
                  <p className="text-zinc-500">{dict.hero.terminalLines[0]}</p>
                  <pre className="text-amber-500" aria-hidden="true">
{`██╗  ██╗ ██████╗ ██████╗  ██████╗
██║ ██╔╝██╔═══██╗██╔══██╗██╔═══██╗
█████╔╝ ██║   ██║██║  ██║██║   ██║`}
                  </pre>
                  <p className="mt-2 text-[#33FF66]">
                    ✓ {dict.hero.terminalLines[1]?.replace(/^✓\s*/, "")}
                  </p>
                  <p className="text-[#33FF66]">
                    ✓ {dict.hero.terminalLines[2]?.replace(/^✓\s*/, "")}
                  </p>
                  <p className="text-zinc-500">
                    ✓ {dict.hero.terminalLines[3]?.replace(/^✓\s*/, "")}
                  </p>
                  <p className="mt-2 text-[#00E5FF]">
                    » {dict.hero.terminalLines[4]?.replace(/^»\s*/, "")}
                  </p>
                  <p className="text-zinc-400">
                    <span className="text-amber-500">❯</span>{" "}
                    {dict.hero.terminalLines[5]}
                  </p>
                  <p className="text-zinc-600">
                    <span className="terminal-cursor">▮</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ STATS BAR ═══════════════ */}
        <section
          className="border-y border-amber-500/20 bg-[#141416]"
          aria-label="Platform statistics"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-8 text-center md:grid-cols-4">
            {[
              {
                value: dict.stats.lessons.value,
                label: dict.stats.lessons.label,
                icon: <BookOpen size={16} aria-hidden="true" />,
              },
              {
                value: dict.stats.sections.value,
                label: dict.stats.sections.label,
                icon: <Layers size={16} aria-hidden="true" />,
              },
              {
                value: dict.stats.hours.value,
                label: dict.stats.hours.label,
                icon: <Clock size={16} aria-hidden="true" />,
              },
              {
                value: dict.stats.offline.value,
                label: dict.stats.offline.label,
                icon: <Shield size={16} aria-hidden="true" />,
              },
            ].map((stat, i) => {
              const delay = (["anim-delay-0", "anim-delay-100", "anim-delay-200", "anim-delay-300"] as const)[i] ?? "anim-delay-0";
              return (
                <div
                  key={stat.label}
                  className={`anim-fade-up ${delay} flex flex-col items-center gap-2`}
                >
                  <div className="text-amber-500">{stat.icon}</div>
                  <div className="font-mono text-3xl font-bold text-zinc-50">
                    {stat.value}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════ WHAT IS KODO FORGE ═══════════════ */}
        <section
          className="mx-auto max-w-6xl px-6 py-28"
          aria-label="What is Kodo Forge"
        >
          <SectionHeader
            index="01"
            label="What is Kodo Forge"
            className="anim-fade-up mb-12"
          />

          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <div className="anim-fade-up anim-delay-100">
              <h2 className="mb-6 font-sans text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl">
                {dict.whatIs.title1}
                <span className="text-amber-500">
                  {dict.whatIs.titleHighlight}
                </span>
                {dict.whatIs.title2}
              </h2>
              <p className="mb-4 font-sans leading-relaxed text-zinc-400">
                {dict.whatIs.p1}
                <strong className="text-zinc-200">{dict.whatIs.p1Bold}</strong>
              </p>
              <p className="mb-4 font-sans leading-relaxed text-zinc-400">
                {dict.whatIs.p2}
              </p>
              <p className="font-sans leading-relaxed text-zinc-400">
                {dict.whatIs.p3Start}
                <strong className="text-zinc-200">{dict.whatIs.p3Bold}</strong>
                {dict.whatIs.p3End}
              </p>
            </div>

            <div className="anim-fade-up anim-delay-200 border border-amber-500/20 bg-[#141416] p-6">
              <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-500">
                {dict.whatIs.learnCycleTitle}
              </h3>
              <p className="mb-6 font-sans text-xs text-zinc-500">
                {dict.whatIs.learnCycleSubtitle}
              </p>
              <div className="space-y-3">
                {dict.whatIs.learnSteps.map((step: any) => (
                  <div key={step.letter} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-amber-500/30 bg-[#1c1c20] font-mono text-sm font-bold text-amber-500">
                      {step.letter}
                    </div>
                    <div>
                      <div className="font-sans text-sm font-medium text-zinc-50">
                        {step.label}
                      </div>
                      <div className="font-sans text-xs text-zinc-500">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ FEATURES ═══════════════ */}
        <section
          className="mx-auto max-w-6xl px-6 py-28"
          aria-label="Features"
          id="features"
        >
          <SectionHeader
            index="02"
            label="Features"
            className="anim-fade-up mb-12"
          />

          <div className="anim-fade-up anim-delay-100 mb-12 max-w-3xl">
            <h2 className="mb-4 font-sans text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl">
              {dict.features.title}
            </h2>
            <p className="font-sans text-zinc-400">{dict.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-px bg-amber-500/10 md:grid-cols-2 lg:grid-cols-3">
            {dict.features.items.map((feature: any, i: number) => {
              const featureDelays = [
                "anim-delay-0",
                "anim-delay-75",
                "anim-delay-150",
                "anim-delay-200",
                "anim-delay-300",
                "anim-delay-400",
              ] as const;
              const delay = featureDelays[i] ?? "anim-delay-0";
              return (
                <div
                  key={feature.title}
                  className={`anim-fade-up ${delay} group flex flex-col gap-4 bg-[#141416] p-7 transition-colors hover:bg-[#1c1c20]`}
                >
                  <div className="text-amber-500 transition-transform duration-200 group-hover:translate-x-1">
                    {featureIcons[i]}
                  </div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-[0.15em] text-zinc-50">
                    {feature.title}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-300">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════ COURSES — ls -la view ═══════════════ */}
        <section
          className="mx-auto max-w-6xl px-6 py-28"
          aria-label="Course catalog"
        >
          <SectionHeader
            index="03"
            label="Courses"
            className="anim-fade-up mb-12"
          />

          <div className="anim-fade-up anim-delay-100 mb-10 max-w-3xl">
            <h2 className="mb-4 font-sans text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl">
              {dict.courses.title}
            </h2>
            <p className="font-sans text-zinc-400">{dict.courses.subtitle}</p>
          </div>

          {/* Terminal-style directory listing. */}
          <div className="anim-fade-up anim-delay-200 border border-amber-500/25 bg-[#141416]">
            <div className="flex items-center justify-between border-b border-amber-500/20 px-4 py-2 font-mono text-[11px] text-zinc-500">
              <span>kodo@forge:~$ ls -la courses/</span>
              <span className="text-amber-500/70">{courses.length} items</span>
            </div>

            <div className="divide-y divide-amber-500/10 p-2 font-mono text-[13px] sm:text-sm">
              {/* Header row */}
              <div className="hidden px-3 py-1.5 text-[10px] uppercase tracking-widest text-zinc-600 sm:grid sm:grid-cols-[auto_auto_auto_auto_1fr_auto] sm:gap-4">
                <span>perms</span>
                <span>lessons</span>
                <span>owner</span>
                <span>group</span>
                <span>name</span>
                <span>status</span>
              </div>

              {courses.map((course) => {
                const status = COURSE_STATUS[course.status];
                const lessonsField =
                  course.status === "active"
                    ? String(course.totalLessons).padStart(2, " ")
                    : " -";

                return (
                  <Link
                    key={course.id}
                    href={`/${lang}/courses/${course.slug}`}
                    className="block px-3 py-2.5 transition-colors hover:bg-[#1c1c20] focus:outline-none focus-visible:bg-[#1c1c20] focus-visible:ring-1 focus-visible:ring-amber-500/60"
                  >
                    <div className="flex items-center justify-between gap-4 sm:grid sm:grid-cols-[auto_auto_auto_auto_1fr_auto] sm:gap-4">
                      <span className="text-zinc-500">drwxr-xr-x</span>
                      <span className="hidden text-zinc-500 sm:inline">
                        {lessonsField}
                      </span>
                      <span className="hidden text-zinc-500 sm:inline">
                        kodo
                      </span>
                      <span className="hidden text-zinc-500 sm:inline">
                        staff
                      </span>
                      <span className="flex-1 truncate font-bold text-amber-500">
                        {pad(`${course.slug}/`, 14)}
                        <span className="ml-2 hidden font-normal text-zinc-400 md:inline">
                          {course.tagline}
                        </span>
                      </span>
                      <span
                        className={`whitespace-nowrap text-[11px] font-bold tracking-wider ${status.classes}`}
                      >
                        [ {status.label} ]
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-amber-500/15 px-4 py-2 font-mono text-[11px] text-zinc-600">
              total {courses.length} · typescript/ available · others in
              development
            </div>
          </div>

          <div className="anim-fade-up anim-delay-300 mt-10 text-center">
            <Link
              href={`/${lang}/courses`}
              className="inline-flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-[0.2em] text-amber-500 transition-colors hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {dict.courses.viewAll}
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section
          className="border-y border-amber-500/15 bg-[#141416]"
          aria-label="How to get started"
        >
          <div className="mx-auto max-w-6xl px-6 py-28">
            <SectionHeader
              index="04"
              label="How it works"
              className="anim-fade-up mb-12"
            />

            <div className="anim-fade-up anim-delay-100 mb-14 max-w-3xl">
              <h2 className="mb-4 font-sans text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl">
                {dict.howItWorks.title}
              </h2>
              <p className="font-sans text-zinc-400">
                {dict.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {dict.howItWorks.steps.map((item: any, i: number) => {
                const delays = [
                  "anim-delay-0",
                  "anim-delay-150",
                  "anim-delay-300",
                ] as const;
                const delay = delays[i] ?? "anim-delay-0";
                return (
                  <div
                    key={item.step}
                    className={`anim-fade-up ${delay} border border-amber-500/20 bg-[#0b0b0d] p-6 transition-colors hover:border-amber-500/50`}
                  >
                    <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/60">
                      Step {item.step}
                    </div>
                    <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.15em] text-zinc-50">
                      {item.title}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-zinc-400">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section
          className="mx-auto max-w-4xl px-6 py-28"
          aria-label="Frequently asked questions"
          id="faq"
        >
          <SectionHeader
            index="05"
            label="FAQ"
            className="anim-fade-up mb-12"
          />

          <div className="anim-fade-up anim-delay-100 mb-12">
            <h2 className="mb-2 font-sans text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl">
              {dict.faq.title}
            </h2>
            <p className="font-mono text-xs tracking-widest text-amber-500/70">
              ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
            </p>
          </div>

          <div className="anim-fade-up anim-delay-200">
            <FaqAccordion items={faqItems} />
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section
          className="mx-auto max-w-4xl px-6 py-28 text-center"
          aria-label="Call to action"
        >
          <SectionHeader
            index="06"
            label="Get started"
            className="anim-fade-up mb-12 justify-center"
          />

          <div className="anim-fade-up anim-delay-100">
            <h2 className="mb-6 font-sans text-4xl font-semibold leading-tight text-zinc-50 sm:text-5xl">
              {dict.cta.title1}
              <span className="text-amber-500">{dict.cta.titleHighlight}</span>
              {dict.cta.title2}
            </h2>

            <p className="mx-auto mb-4 font-mono text-xs tracking-widest text-amber-500/70">
              ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
            </p>

            <p className="mx-auto mb-10 max-w-xl font-sans text-zinc-400">
              {dict.cta.description}
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href={`/${lang}/download`}
                className="inline-flex items-center justify-center gap-3 border border-amber-500 bg-amber-500 px-10 py-5 font-mono text-base font-bold uppercase tracking-widest text-[#0b0b0d] transition-all hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]"
              >
                <Download size={18} aria-hidden="true" />
                {dict.cta.downloadBtn}
              </Link>
              <Link
                href={`/${lang}/docs`}
                className="inline-flex items-center justify-center gap-3 border border-amber-500/40 px-10 py-5 font-mono text-base font-bold uppercase tracking-widest text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-amber-500/80 hover:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                {dict.cta.docsBtn}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
