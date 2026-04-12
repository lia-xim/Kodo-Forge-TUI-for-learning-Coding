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

const featureIcons = [
  <Zap key="zap" size={28} />,
  <BookOpen key="book" size={28} />,
  <Brain key="brain" size={28} />,
  <Shield key="shield" size={28} />,
  <Layers key="layers" size={28} />,
  <Sparkles key="sparkles" size={28} />,
];

interface HomePageProps {
  dict: Record<string, any>;
  lang: string;
}

export default function HomePage({ dict, lang }: HomePageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((faq: any) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

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
                <span className="animate-pulse">{dict.hero.badge}</span>
              </div>

              <h1
                className="text-5xl sm:text-7xl font-extrabold text-white tracking-tighter leading-[1.05] mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {dict.hero.title1}
                <br />
                <span className="text-[#FFB000] drop-shadow-[0_0_30px_rgba(255,176,0,0.4)]">
                  {dict.hero.title2}
                </span>
              </h1>

              <p
                className="text-lg text-zinc-400 max-w-lg leading-relaxed mb-10 border-l-2 border-[#FFB000]/30 pl-5"
                dangerouslySetInnerHTML={{ __html: dict.hero.description }}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/${lang}/download`}>
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,176,0,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="retro-glass flex items-center justify-center gap-3 px-8 py-4 text-[#FFB000] font-bold uppercase tracking-widest rounded-sm cursor-pointer border border-[#FFB000]/30 hover:border-[#FFB000]/60 transition-all"
                  >
                    <Download size={18} /> {dict.hero.downloadBtn}
                  </motion.div>
                </Link>
                <Link href={`/${lang}/courses`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-3 px-8 py-4 text-zinc-400 hover:text-white uppercase tracking-widest transition-colors font-bold cursor-pointer"
                  >
                    {dict.hero.browseBtn} <ArrowRight size={16} />
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
                  <span className="text-xs text-zinc-600 ml-3 font-mono">{dict.hero.terminalTitle}</span>
                </div>
                <div className="p-5 font-mono text-sm space-y-1">
                  <p className="text-zinc-500">{dict.hero.terminalLines[0]}</p>
                  <p className="text-[#FFB000] font-bold">
                    ██╗  ██╗ ██████╗ ██████╗  ██████╗
                  </p>
                  <p className="text-[#FFB000]/70">
                    █████╔╝ ██║  ██║██║  ██║██║  ██║
                  </p>
                  <p className="text-green-400 mt-1">✓ {dict.hero.terminalLines[1]?.replace(/^✓\s*/, "")}</p>
                  <p className="text-green-400">✓ {dict.hero.terminalLines[2]?.replace(/^✓\s*/, "")}</p>
                  <p className="text-zinc-500">✓ {dict.hero.terminalLines[3]?.replace(/^✓\s*/, "")}</p>
                  <p className="text-cyan-400 mt-2">» {dict.hero.terminalLines[4]?.replace(/^»\s*/, "")}</p>
                  <p className="text-zinc-400">
                    <span className="text-[#FFB000]">❯</span> {dict.hero.terminalLines[5]}
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
              { value: dict.stats.lessons.value, label: dict.stats.lessons.label, icon: <BookOpen size={18} /> },
              { value: dict.stats.sections.value, label: dict.stats.sections.label, icon: <Layers size={18} /> },
              { value: dict.stats.hours.value, label: dict.stats.hours.label, icon: <Clock size={18} /> },
              { value: dict.stats.offline.value, label: dict.stats.offline.label, icon: <Shield size={18} /> },
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
                {dict.whatIs.title1}<span className="text-[#FFB000]">{dict.whatIs.titleHighlight}</span>{dict.whatIs.title2}
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                {dict.whatIs.p1}
                <strong className="text-zinc-200">{dict.whatIs.p1Bold}</strong>
              </p>
              <p className="text-zinc-400 leading-relaxed mb-4">
                {dict.whatIs.p2}
              </p>
              <p className="text-zinc-400 leading-relaxed">
                {dict.whatIs.p3Start}<strong className="text-zinc-200">{dict.whatIs.p3Bold}</strong>{dict.whatIs.p3End}
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
              <h3 className="text-sm font-bold text-[#FFB000] uppercase tracking-widest mb-4">{dict.whatIs.learnCycleTitle}</h3>
              <p className="text-xs text-zinc-500 mb-4">{dict.whatIs.learnCycleSubtitle}</p>
              <div className="space-y-3">
                {dict.whatIs.learnSteps.map((step: any) => (
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
              {dict.features.title}
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              {dict.features.subtitle}
            </p>
            <div className="w-16 h-1 bg-[#FFB000] mx-auto mt-6 rounded-full shadow-[0_0_10px_#FFB000]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dict.features.items.map((feature: any, i: number) => (
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
                  {featureIcons[i]}
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
              {dict.courses.title}
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              {dict.courses.subtitle}
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
                <Link href={`/${lang}/courses/${course.slug}`}>
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
                          {dict.common.availableNow}
                        </div>
                      )}
                      {course.status === "planned" && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-zinc-500/20 border border-zinc-500/30 rounded text-xs text-zinc-400 font-bold uppercase tracking-wider">
                          {dict.common.comingSoon}
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
                        <span>{course.totalLessons} {dict.common.lessons}</span>
                        <span>·</span>
                        <span>{course.estimatedHours}h {dict.common.content}</span>
                        <span>·</span>
                        <span>{course.phases.length} {dict.common.phases}</span>
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
              href={`/${lang}/courses`}
              className="text-[#FFB000] hover:text-amber-300 font-bold uppercase tracking-widest text-sm transition-colors"
            >
              {dict.courses.viewAll}
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
                {dict.howItWorks.title}
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto">
                {dict.howItWorks.subtitle}
              </p>
              <div className="w-16 h-1 bg-[#FFB000] mx-auto mt-6 rounded-full shadow-[0_0_10px_#FFB000]" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dict.howItWorks.steps.map((item: any, i: number) => (
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
              {dict.faq.title}
            </h2>
            <div className="w-16 h-1 bg-[#FFB000] mx-auto mt-6 rounded-full shadow-[0_0_10px_#FFB000]" />
          </motion.div>

          <div className="space-y-3">
            {dict.faq.items.map((faq: any, i: number) => (
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
              {dict.cta.title1}
              <span className="text-[#FFB000] drop-shadow-[0_0_20px_rgba(255,176,0,0.4)]">{dict.cta.titleHighlight}</span>
              {dict.cta.title2}
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto mb-10">
              {dict.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${lang}/download`}>
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,176,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-[#FFB000] text-[#09090b] font-bold uppercase tracking-widest rounded-sm cursor-pointer text-lg transition-all hover:bg-amber-400"
                >
                  <Download size={20} /> {dict.cta.downloadBtn}
                </motion.div>
              </Link>
              <Link href={`/${lang}/docs`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-5 text-zinc-400 hover:text-white font-bold uppercase tracking-widest cursor-pointer text-lg transition-colors"
                >
                  {dict.cta.docsBtn} <ArrowRight size={18} />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </section>
      </article>
    </>
  );
}
