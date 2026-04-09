"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
  ChevronDown,
} from "lucide-react";
import { courses } from "@/data/courses";
import { useState } from "react";
import Script from "next/script";

const fadeUp: any = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const faqs = [
  {
    q: "What is Kodo Forge?",
    a: "Kodo Forge is a free, open-source Terminal User Interface (TUI) learning platform. It lets you learn TypeScript, Angular, React and Next.js directly inside your command line terminal — with zero internet connection, zero dependencies, and zero distractions.",
  },
  {
    q: "Is Kodo Forge really free?",
    a: "Yes, 100% free and open source under the MIT license. There are no hidden costs, no subscriptions, and no premium tiers. All 144+ lessons across 4 courses are included.",
  },
  {
    q: "Do I need an internet connection?",
    a: "No. Kodo Forge runs entirely offline. Once you download the executable, everything works without any internet connection. Your progress is saved locally on your machine.",
  },
  {
    q: "What programming languages and frameworks can I learn?",
    a: "Kodo Forge currently offers courses in TypeScript (44 lessons), Angular (40 lessons), React with TypeScript (40 lessons), and Next.js (20 lessons). The TypeScript course is the foundation — start there.",
  },
  {
    q: "How is this different from Udemy, Codecademy, or freeCodeCamp?",
    a: "Unlike browser-based platforms, Kodo Forge runs in your terminal — the same tool professional developers use every day. There are no ads, no notifications, no social features. It's designed for deep focus and uses science-backed techniques like spaced repetition and kinetic reading to maximize retention.",
  },
  {
    q: "Can I create my own courses?",
    a: "Absolutely! Kodo Forge is a data-driven engine. Courses are just folders of Markdown files. You can create courses on any topic — not just programming. Check the documentation for the content authoring guide.",
  },
  {
    q: "What operating systems are supported?",
    a: "Kodo Forge provides standalone executables for Windows (x64), macOS (Apple Silicon), and Linux (x64). No installation required — just download and run.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="font-[family-name:var(--font-mono)]">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/screenshots/kodo_screen_1.png"
              alt="Kodo Forge terminal learning platform running in a dark retro-futuristic environment"
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-[#09090b]/70 to-[#09090b]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 text-[#FFB000] font-bold text-sm mb-6 tracking-[0.3em] uppercase">
                <Terminal size={16} />
                <span className="animate-pulse">open_source · free · offline</span>
              </div>

              <h1
                className="text-5xl sm:text-7xl font-extrabold text-white tracking-tighter leading-[1.05] mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Learn TypeScript, React &amp; Angular
                <br />
                <span className="text-[#FFB000] drop-shadow-[0_0_30px_rgba(255,176,0,0.4)]">
                  in your terminal.
                </span>
              </h1>

              <p className="text-lg text-zinc-400 max-w-lg leading-relaxed mb-10 border-l-2 border-[#FFB000]/30 pl-5">
                Kodo Forge is a <strong className="text-zinc-200">free, open-source learning platform</strong> that
                runs entirely in your command line. 144+ interactive lessons, spaced repetition,
                gamified progress — without browser, without internet, without distractions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/download">
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,176,0,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="retro-glass flex items-center justify-center gap-3 px-8 py-4 text-[#FFB000] font-bold uppercase tracking-widest rounded-sm cursor-pointer border border-[#FFB000]/30 hover:border-[#FFB000]/60 transition-all"
                  >
                    <Download size={18} /> Download Free
                  </motion.div>
                </Link>
                <Link href="/courses">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-3 px-8 py-4 text-zinc-400 hover:text-white uppercase tracking-widest transition-colors font-bold cursor-pointer"
                  >
                    Browse All 4 Courses <ArrowRight size={16} />
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Terminal mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block"
            >
              <motion.div
                animate={{ y: [-8, 8] }}
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 4, ease: "easeInOut" }}
                className="retro-glass rounded-lg p-1 shadow-[0_0_60px_rgba(255,176,0,0.1)]"
              >
                <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/60">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="text-xs text-zinc-600 ml-3 font-mono">kodo-forge — ~/typescript</span>
                </div>
                <div className="p-5 font-mono text-sm space-y-1">
                  <p className="text-zinc-500">$ kodo-forge start</p>
                  <p className="text-[#FFB000] font-bold">
                    ██╗  ██╗ ██████╗ ██████╗  ██████╗
                  </p>
                  <p className="text-[#FFB000]/70">
                    █████╔╝ ██║  ██║██║  ██║██║  ██║
                  </p>
                  <p className="text-green-400 mt-1">✓ TypeScript Deep Learning loaded</p>
                  <p className="text-green-400">✓ 44 lessons · 239 sections · 82h content</p>
                  <p className="text-zinc-500">✓ Streak: 12 days · 24/44 complete</p>
                  <p className="text-cyan-400 mt-2">» Spaced Repetition: 3 reviews due</p>
                  <p className="text-zinc-400">
                    <span className="text-[#FFB000]">❯</span> Resuming L25: Type-safe Error Handling...
                  </p>
                  <p className="text-zinc-600 animate-pulse">▮</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ STATS BAR ═══════════════ */}
        <section className="border-y border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm" aria-label="Platform statistics">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "144+", label: "Interactive Lessons", icon: <BookOpen size={18} /> },
              { value: "751", label: "Learning Sections", icon: <Layers size={18} /> },
              { value: "350h", label: "Total Content", icon: <Clock size={18} /> },
              { value: "100%", label: "Free & Offline", icon: <Shield size={18} /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-[#FFB000]">{stat.icon}</div>
                <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════ WHAT IS KODO FORGE ═══════════════ */}
        <section className="max-w-6xl mx-auto px-6 py-28" aria-label="What is Kodo Forge">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
            >
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                What is a <span className="text-[#FFB000]">Terminal Learning Platform</span>?
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Most coding courses run in a browser — surrounded by notifications, social media, and infinite tabs.
                <strong className="text-zinc-200"> Kodo Forge takes a radically different approach.</strong>
              </p>
              <p className="text-zinc-400 leading-relaxed mb-4">
                It runs as a native application inside your terminal (command line).
                The same tool that professional developers use every single day to write and deploy software.
                No ads, no accounts, no tracking. Just you and the code.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Research shows that <strong className="text-zinc-200">distraction-free environments dramatically improve
                learning retention</strong>. Kodo Forge combines this with science-backed techniques
                like spaced repetition and active recall to help you truly master — not just consume —
                TypeScript, React, Angular, and full-stack web development.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="retro-glass rounded-lg p-6"
            >
              <h3 className="text-sm font-bold text-[#FFB000] uppercase tracking-widest mb-4">The LEARN Cycle</h3>
              <p className="text-xs text-zinc-500 mb-4">Every lesson follows a proven 5-step methodology:</p>
              <div className="space-y-3">
                {[
                  { letter: "L", label: "Lesen & Verstehen", desc: "Theory with diagrams and analogies" },
                  { letter: "E", label: "Erkunden", desc: "Run live code examples" },
                  { letter: "A", label: "Anwenden", desc: "Exercises with increasing difficulty" },
                  { letter: "R", label: "Reflektieren", desc: "Interactive quizzes in the terminal" },
                  { letter: "N", label: "Nachschlagen", desc: "Compact cheatsheet for reference" },
                ].map((step) => (
                  <div key={step.letter} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center text-[#FFB000] font-bold text-sm flex-shrink-0">
                      {step.letter}
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">{step.label}</div>
                      <div className="text-xs text-zinc-500">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ FEATURES ═══════════════ */}
        <section className="max-w-6xl mx-auto px-6 py-28" aria-label="Features" id="features">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Why Developers Choose Kodo Forge
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Built from scratch for one purpose: deep-focus, distraction-free learning that actually sticks.
            </p>
            <div className="w-16 h-1 bg-[#FFB000] mx-auto mt-6 rounded-full shadow-[0_0_10px_#FFB000]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={28} />,
                title: "Instant Startup",
                desc: "Launches in under 200ms. No loading screens, no splash pages. A single executable — just double-click and learn.",
              },
              {
                icon: <BookOpen size={28} />,
                title: "Kinetic Reading Engine",
                desc: "A custom text progression engine that reveals content at your pace. No mindless scrolling — every section demands your attention.",
              },
              {
                icon: <Brain size={28} />,
                title: "Built-in Spaced Repetition",
                desc: "Science-backed flashcard system with smart scheduling. Review concepts right before you forget them, with streak tracking.",
              },
              {
                icon: <Shield size={28} />,
                title: "100% Offline & Private",
                desc: "No internet required, no telemetry, no accounts, no data collection. Your learning data stays on your machine. Always.",
              },
              {
                icon: <Layers size={28} />,
                title: "Data-Driven Architecture",
                desc: "Courses are Markdown folders. Drop in your own content — programming, languages, science — and the engine renders it instantly.",
              },
              {
                icon: <Sparkles size={28} />,
                title: "Gamified Progress Tracking",
                desc: "Daily streaks, sparkline activity charts, phase completion, and course recommendations. Stay motivated without social media dopamine.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="retro-glass retro-glass-hover p-7 rounded-lg flex flex-col gap-4 group cursor-default"
              >
                <div className="text-[#FFB000] group-hover:scale-110 transition-transform origin-left">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">{feature.title}</h3>
                <p className="text-zinc-500 group-hover:text-zinc-300 transition-colors text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════ COURSE PREVIEWS ═══════════════ */}
        <section className="max-w-6xl mx-auto px-6 py-28" aria-label="Course catalog">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              4 Professional Courses — All Free
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              A complete web development learning path. Start with TypeScript fundamentals,
              then choose Angular, React, or go full-stack with Next.js.
            </p>
            <div className="w-16 h-1 bg-[#FFB000] mx-auto mt-6 rounded-full shadow-[0_0_10px_#FFB000]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Link href={`/courses/${course.slug}`}>
                  <div className="retro-glass rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg h-full">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={course.image}
                        alt={`${course.name} — terminal course for learning ${course.topics.join(", ")}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
                      {course.status === "active" && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-bold uppercase tracking-wider">
                          Available Now
                        </div>
                      )}
                      {course.status === "planned" && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-zinc-500/20 border border-zinc-500/30 rounded text-xs text-zinc-400 font-bold uppercase tracking-wider">
                          Coming Soon
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3
                        className="text-xl font-bold text-white mb-1 group-hover:text-[#FFB000] transition-colors"
                        style={{ color: course.status === "active" ? course.color : undefined }}
                      >
                        {course.name}
                      </h3>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">{course.tagline}</p>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                        <span>{course.totalLessons} Lessons</span>
                        <span>·</span>
                        <span>{course.estimatedHours}h Content</span>
                        <span>·</span>
                        <span>{course.phases.length} Phases</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
                        <div className="flex gap-2 flex-wrap">
                          {course.topics.slice(0, 3).map((t) => (
                            <span key={t} className="px-2 py-1 text-[10px] rounded bg-zinc-800/60 text-zinc-400 uppercase tracking-wider">
                              {t}
                            </span>
                          ))}
                        </div>
                        <ChevronRight size={16} className="text-zinc-600 group-hover:text-[#FFB000] transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mt-12"
          >
            <Link
              href="/courses"
              className="text-[#FFB000] hover:text-amber-300 font-bold uppercase tracking-widest text-sm transition-colors"
            >
              View Full Curriculum for All Courses →
            </Link>
          </motion.div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className="border-y border-zinc-800/60 bg-zinc-950/30" aria-label="How to get started">
          <div className="max-w-6xl mx-auto px-6 py-28">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="text-center mb-16"
            >
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Start Learning in 3 Steps
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto">
                No sign-up. No credit card. No complicated setup. From download to learning in under 60 seconds.
              </p>
              <div className="w-16 h-1 bg-[#FFB000] mx-auto mt-6 rounded-full shadow-[0_0_10px_#FFB000]" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Download",
                  desc: "Grab the single executable for Windows, macOS, or Linux. No Node.js, no Python, no admin rights needed. Just one file.",
                },
                {
                  step: "02",
                  title: "Launch",
                  desc: "Double-click the file or run it from your terminal. The TUI boots in under 200ms and automatically detects your courses.",
                },
                {
                  step: "03",
                  title: "Learn & Master",
                  desc: "Navigate lessons with your keyboard. Read theory, run examples, solve exercises, take quizzes. Your progress is saved automatically.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="text-center"
                >
                  <div
                    className="text-5xl font-black text-[#FFB000]/20 mb-4"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-3">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section className="max-w-4xl mx-auto px-6 py-28" aria-label="Frequently asked questions" id="faq">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-[#FFB000] mx-auto mt-6 rounded-full shadow-[0_0_10px_#FFB000]" />
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="retro-glass rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
                >
                  <span className="font-bold text-white text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-zinc-500 transition-transform flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section className="max-w-4xl mx-auto px-6 py-28 text-center" aria-label="Call to action">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Ready to learn{" "}
              <span className="text-[#FFB000] drop-shadow-[0_0_20px_rgba(255,176,0,0.4)]">differently</span>?
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-10">
              Join developers who swapped endless browser tabs for deep-focus terminal learning.
              Download Kodo Forge, open your command line, and start mastering web development today. Free forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/download">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,176,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[#FFB000] text-[#09090b] font-bold uppercase tracking-widest rounded-sm cursor-pointer text-lg transition-all hover:bg-amber-400"
                >
                  <Download size={20} /> Download Free
                </motion.div>
              </Link>
              <Link href="/docs">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-5 text-zinc-400 hover:text-white font-bold uppercase tracking-widest cursor-pointer text-lg transition-colors"
                >
                  Read the Docs <ArrowRight size={18} />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </section>
      </article>
    </>
  );
}
