"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Layers,
  Download,
  ChevronDown,
  CheckCircle2,
  Users,
  GraduationCap,
  Lightbulb,
  Brain,
  TrendingUp,
  Briefcase,
  Sparkles,
  Terminal,
  Zap,
  Shield,
  Target,
  Repeat,
  Code,
  BarChart3,
  Eye,
} from "lucide-react";
import { Course, courses } from "@/data/courses";
import { useState, useEffect } from "react";
import Script from "next/script";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/** Map icon string names from dictionaries to actual icon components */
const iconMap: Record<string, React.ElementType> = {
  Layers,
  Brain,
  TrendingUp,
  Briefcase,
  BookOpen,
  Sparkles,
  Terminal,
  Zap,
  Shield,
  Target,
  Repeat,
  Code,
  BarChart3,
  Eye,
  Lightbulb,
  GraduationCap,
};

/** Map didactic highlight titles to icons */
const didacticIconMap: Record<string, React.ElementType> = {
  "Spaced Repetition": Repeat,
  "Adaptive Reading Depth": Eye,
  "Adaptive Lesetiefe": Eye,
  "Interactive Quizzes": Zap,
  "Interaktive Quizzes": Zap,
  "Annotated Code Blocks": Code,
  "Annotierte Code-Blöcke": Code,
  "Review Challenges": Target,
  "Mermaid Diagrams": BarChart3,
  "Mermaid-Diagramme": BarChart3,
};

/** Map target audience index to icon */
const audienceIcons = [Briefcase, BookOpen, Code, GraduationCap];

interface CourseDetailPageProps {
  course: Course;
  dict: Record<string, any>;
  lang: string;
}

/** Terminal preview component with typing animation */
function TerminalPreview({ lines, color }: { lines: string[]; color: string }) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < lines.length) {
      const timeout = setTimeout(() => setVisibleLines((v) => v + 1), 150);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines, lines.length]);

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-800/60 shadow-2xl max-w-md w-full">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/60">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        </div>
        <span className="text-[10px] text-zinc-600 font-mono ml-2">kodo-forge</span>
      </div>
      {/* Terminal body */}
      <div className="bg-[#0c0c0e]/90 backdrop-blur-sm p-4 font-mono text-xs leading-relaxed min-h-[260px]">
        {lines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={`${
              line.startsWith("$") ? "text-green-400" :
              line.startsWith(">") ? "text-amber-400/80" :
              line.startsWith("[") ? "text-zinc-600" :
              line.includes("─") ? "text-zinc-700" :
              "text-zinc-400"
            } ${line === "" ? "h-3" : ""}`}
            style={line.startsWith("  L") || line.startsWith("  Section") ? { color } : undefined}
          >
            {line}
          </div>
        ))}
        {visibleLines < lines.length && (
          <span className="terminal-cursor text-green-400">_</span>
        )}
      </div>
    </div>
  );
}

export default function CourseDetailPage({ course, dict, lang }: CourseDetailPageProps) {
  const [openPhase, setOpenPhase] = useState<number>(0);
  const prereqCourse = course.prerequisite
    ? courses.find((c) => c.id === course.prerequisite)
    : null;

  const t = dict.courseDetail;
  const cd = dict.coursesData[course.id] ?? {};

  // Resolve localized strings with fallback to course data
  const tagline = cd.tagline ?? course.tagline;
  const description = cd.description ?? course.description;
  const longDescription = cd.longDescription ?? course.longDescription;
  const targetAudience = cd.targetAudience ?? course.targetAudience;
  const whatYouLearn = cd.whatYouLearn ?? course.whatYouLearn;
  const didacticHighlights = cd.didacticHighlights ?? course.didacticHighlights;
  const heroQuote = cd.heroQuote ?? t.heroQuote;
  const whyItems = t.whyItems;
  const terminalLines = t.terminalPreviewLines;

  const curriculumMeta = t.curriculumMeta
    .replace("{lessons}", String(course.totalLessons))
    .replace("{phases}", String(course.phases.length))
    .replace("{sections}", String(course.totalSections))
    .replace("{hours}", String(course.estimatedHours));

  const totalLessonsBefore = (phaseIndex: number) => {
    let count = 0;
    for (let i = 0; i < phaseIndex; i++) {
      count += course.phases[i].lessons.length;
    }
    return count;
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: description,
    provider: {
      "@type": "Organization",
      name: "Kodo Forge",
      url: "https://kodoforge.dev",
    },
    isAccessibleForFree: true,
    educationalLevel: course.id === "typescript" ? "Beginner to Advanced" : "Intermediate to Advanced",
    inLanguage: lang,
    numberOfLessons: course.totalLessons,
    timeRequired: `PT${course.estimatedHours}H`,
    teaches: course.topics.join(", "),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "self-paced",
      courseWorkload: `PT${course.estimatedHours}H`,
    },
  };

  return (
    <>
      <Script
        id="course-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      <article>
        {/* ═══════════════════════════════════════════════════════════════
            HERO SECTION — Dramatic gradient mesh + terminal preview
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
          {/* Background layers */}
          <div className="absolute inset-0 z-0">
            <Image
              src={course.image}
              alt={`${course.name} terminal course`}
              fill
              className="object-cover opacity-10"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/30 via-[#09090b]/70 to-[#09090b]" />
          </div>

          {/* Animated gradient mesh */}
          <div
            className="gradient-mesh z-[1]"
            style={{ "--mesh-color": course.color } as React.CSSProperties}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
            <Link
              href={`/${lang}/courses`}
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-10 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t.allCourses}
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
              {/* Left: Text content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex-1 max-w-2xl"
              >
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  {course.status === "active" && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                      style={{
                        color: course.color,
                        borderColor: `${course.color}40`,
                        background: `${course.color}10`,
                      }}
                    >
                      {t.availableNow}
                    </span>
                  )}
                  {course.status === "planned" && (
                    <span className="px-3 py-1 bg-zinc-500/20 border border-zinc-500/30 rounded-full text-xs text-zinc-400 font-bold uppercase tracking-wider">
                      {t.comingSoon}
                    </span>
                  )}
                  {prereqCourse && (
                    <span className="text-xs text-zinc-500">
                      {t.requires}:{" "}
                      <Link href={`/${lang}/courses/${prereqCourse.slug}`} className="hover:underline" style={{ color: course.color }}>
                        {prereqCourse.name}
                      </Link>
                    </span>
                  )}
                </div>

                <h1
                  className="text-5xl sm:text-7xl font-bold mb-4 leading-[1.05] tracking-tight"
                  style={{ color: course.color, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {course.name}
                </h1>
                <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mb-8 leading-relaxed">{tagline}</p>

                {/* Stats bar — glassmorphism cards */}
                <div className="flex flex-wrap gap-3 mb-10">
                  {[
                    { icon: BookOpen, value: course.totalLessons, label: dict.common.lessons },
                    { icon: Layers, value: course.totalSections, label: dict.common.sections },
                    { icon: Clock, value: `~${course.estimatedHours}h`, label: dict.common.content },
                    { icon: GraduationCap, value: course.phases.length, label: dict.common.phases },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm"
                    >
                      <stat.icon size={15} style={{ color: course.color }} />
                      <span className="text-sm text-white font-semibold">{stat.value}</span>
                      <span className="text-xs text-zinc-500">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>

                <Link href={`/${lang}/download`}>
                  <motion.div
                    whileHover={{ scale: 1.03, boxShadow: `0 0 40px ${course.glowColor}` }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-widest rounded-md cursor-pointer border-2 transition-all text-sm"
                    style={{
                      color: course.color,
                      borderColor: `${course.color}50`,
                      background: `${course.color}12`,
                    }}
                  >
                    <Download size={18} /> {t.startFree}
                  </motion.div>
                </Link>
              </motion.div>

              {/* Right: Terminal preview */}
              {terminalLines && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                  className="hidden lg:block flex-shrink-0"
                >
                  <TerminalPreview lines={terminalLines} color={course.color} />
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SCREENSHOTS GALLERY
        ═══════════════════════════════════════════════════════════════ */}
        {course.screenshots && course.screenshots.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-12 -mt-12 relative z-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {course.screenshots.map((src, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-zinc-800/60 shadow-2xl relative aspect-[16/9] group">
                  <Image
                    src={src}
                    alt={`${course.name} Platform Screenshot ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#09090b]/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
              ))}
            </motion.div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            WHY THIS COURSE? — 3 compelling differentiators
        ═══════════════════════════════════════════════════════════════ */}
        {whyItems && whyItems.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-20" aria-label="Why this course">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.h2
                variants={staggerChild}
                className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t.whyThisCourse}
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {whyItems.map((item: { icon: string; title: string; description: string }, i: number) => {
                  const IconComp = iconMap[item.icon] ?? Sparkles;
                  return (
                    <motion.div
                      key={item.title}
                      variants={staggerChild}
                      className="glow-card rounded-xl p-8 flex flex-col gap-4"
                      style={{ "--glow-color": `${course.color}30` } as React.CSSProperties}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ background: `${course.color}15` }}
                      >
                        <IconComp size={22} style={{ color: course.color }} />
                      </div>
                      <h3
                        className="text-lg font-bold text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            LONG DESCRIPTION — with decorative border + pull quotes
        ═══════════════════════════════════════════════════════════════ */}
        {longDescription && (
          <section className="max-w-5xl mx-auto px-6 py-20" aria-label="Course overview">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t.aboutCourse}
              </h2>
              <div
                className="pl-6 border-l-2 space-y-5"
                style={{ borderColor: `${course.color}40` }}
              >
                {longDescription.split("\n\n").map((p: string, i: number) => {
                  // Detect "pull-quote" worthy paragraphs (short, impactful)
                  const isPullQuote = p.length < 180 && (
                    p.includes("special") || p.includes("Besondere") ||
                    p.includes("sets this apart") || p.includes("unterscheidet")
                  );
                  return isPullQuote ? (
                    <div
                      key={i}
                      className="pull-quote"
                      style={{ "--quote-color": course.color } as React.CSSProperties}
                    >
                      {p}
                    </div>
                  ) : (
                    <p key={i} className="text-base text-zinc-400 leading-[1.8]">
                      {p}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TARGET AUDIENCE — Full-width cards with gradient borders
        ═══════════════════════════════════════════════════════════════ */}
        {targetAudience && (
          <section className="max-w-5xl mx-auto px-6 py-16" aria-label="Target audience">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.div variants={staggerChild} className="flex items-center gap-3 mb-8">
                <Users size={22} style={{ color: course.color }} />
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t.targetAudience}
                </h2>
              </motion.div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {targetAudience.map((item: string, i: number) => {
                  const AudienceIcon = audienceIcons[i % audienceIcons.length];
                  return (
                    <motion.div
                      key={i}
                      variants={staggerChild}
                      className="glow-card rounded-xl p-5 flex items-start gap-4"
                      style={{ "--glow-color": `${course.color}25` } as React.CSSProperties}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${course.color}12` }}
                      >
                        <AudienceIcon size={18} style={{ color: course.color }} />
                      </div>
                      <span className="text-sm text-zinc-300 leading-relaxed pt-2">{item}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            WHAT YOU'LL LEARN — Grouped with numbered counters
        ═══════════════════════════════════════════════════════════════ */}
        {whatYouLearn && (
          <section className="max-w-5xl mx-auto px-6 py-20 border-y border-zinc-800/30" aria-label="Learning outcomes">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.div variants={staggerChild} className="flex items-center justify-between mb-10 flex-wrap gap-4">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t.whatYouLearn}
                </h2>
                <span
                  className="text-sm font-mono px-3 py-1.5 rounded-full border"
                  style={{
                    color: course.color,
                    borderColor: `${course.color}30`,
                    background: `${course.color}08`,
                  }}
                >
                  {t.learningOutcomes?.replace("{count}", String(whatYouLearn.length)) ?? `${whatYouLearn.length} outcomes`}
                </span>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                {whatYouLearn.map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    variants={staggerChild}
                    className="flex items-start gap-4 py-2"
                  >
                    <span
                      className="text-xs font-mono font-bold w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        color: course.color,
                        background: `${course.color}12`,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-zinc-300 leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            DIDACTIC HIGHLIGHTS — Larger cards with unique icons
        ═══════════════════════════════════════════════════════════════ */}
        {didacticHighlights && (
          <section className="max-w-6xl mx-auto px-6 py-20" aria-label="Didactic approach">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.div variants={staggerChild} className="flex items-center gap-3 mb-3">
                <Lightbulb size={22} style={{ color: course.color }} />
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {t.didacticConcept}
                </h2>
              </motion.div>
              <motion.p variants={staggerChild} className="text-zinc-400 mb-10 max-w-2xl leading-relaxed">
                {t.didacticDesc}
              </motion.p>

              {/* Mobile: horizontal scroll / Desktop: 3-col grid */}
              <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto scroll-hidden pb-4 md:pb-0 snap-x snap-mandatory md:snap-none -mx-6 px-6 md:mx-0 md:px-0">
                {didacticHighlights.map((h: { title: string; description: string }, i: number) => {
                  const HighlightIcon = didacticIconMap[h.title] ?? Sparkles;
                  return (
                    <motion.div
                      key={h.title}
                      variants={staggerChild}
                      className="glow-card rounded-xl p-6 flex flex-col gap-4 min-w-[280px] md:min-w-0 snap-start"
                      style={{ "--glow-color": `${course.color}25` } as React.CSSProperties}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${course.color}12` }}
                      >
                        <HighlightIcon size={20} style={{ color: course.color }} />
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{h.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{h.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TOPICS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2
              variants={staggerChild}
              className="text-2xl sm:text-3xl font-bold text-white mb-8"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t.coveredTopics}
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {course.topics.map((topic, i) => (
                <motion.div
                  key={topic}
                  variants={staggerChild}
                  className="glow-card px-4 py-3.5 rounded-lg text-sm text-zinc-300 text-center font-medium"
                  style={{ "--glow-color": `${course.color}20` } as React.CSSProperties}
                >
                  {topic}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CURRICULUM ACCORDION — with progress bars per phase
        ═══════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 py-20" aria-label="Full curriculum">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2
              variants={staggerChild}
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t.fullCurriculum}
            </motion.h2>
            <motion.p variants={staggerChild} className="text-sm text-zinc-500 mb-10">
              {curriculumMeta}
            </motion.p>

            <div className="space-y-3">
              {course.phases.map((phase, pi) => {
                const phasePercent = Math.round((phase.lessons.length / course.totalLessons) * 100);
                const globalStart = totalLessonsBefore(pi);
                return (
                  <motion.div
                    key={phase.name}
                    variants={staggerChild}
                    className="glow-card rounded-xl overflow-hidden"
                    style={{ "--glow-color": `${course.color}20` } as React.CSSProperties}
                  >
                    <button
                      onClick={() => setOpenPhase(openPhase === pi ? -1 : pi)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/20 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span
                          className="text-xl font-black opacity-40"
                          style={{ color: course.color, fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {String(pi + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-white truncate">{phase.name}</span>
                            <span className="text-xs text-zinc-500 flex-shrink-0">
                              {phase.lessons.length} {dict.common.lessons}
                            </span>
                          </div>
                          {/* Progress bar showing relative size */}
                          <div className="w-full h-1 rounded-full bg-zinc-800/60 overflow-hidden max-w-[200px]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${phasePercent}%`,
                                background: course.color,
                                opacity: 0.5,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-zinc-500 transition-transform duration-300 ml-4 flex-shrink-0 ${
                          openPhase === pi ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openPhase === pi && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="border-t border-zinc-800/30"
                      >
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {phase.lessons.map((lesson, li) => (
                            <div key={li} className="flex items-center gap-3 text-sm text-zinc-400 py-2 px-2 rounded-md hover:bg-zinc-800/20 transition-colors">
                              <span
                                className="text-xs font-mono w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{
                                  color: course.color,
                                  background: `${course.color}10`,
                                  opacity: 0.7,
                                }}
                              >
                                {String(globalStart + li + 1).padStart(2, "0")}
                              </span>
                              <span className="truncate">{lesson}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FINAL CTA — Full-width dark section with ambient glow
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden" aria-label="Start learning">
          {/* Ambient glow */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[150px] opacity-[0.07]"
              style={{ background: course.color }}
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Quote */}
              <p
                className="text-sm uppercase tracking-[0.2em] mb-8 font-mono"
                style={{ color: `${course.color}80` }}
              >
                {heroQuote}
              </p>

              <h2
                className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t.readyToStart}<span style={{ color: course.color }}>{course.name}</span>{t.readyToStart2}
              </h2>
              <p className="text-zinc-500 mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
                {t.downloadCta}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`/${lang}/download`}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-[#FFB000] text-[#09090b] font-bold uppercase tracking-widest rounded-md cursor-pointer text-sm"
                  >
                    <Download size={18} /> {t.downloadFree}
                  </motion.div>
                </Link>
                <Link href={`/${lang}/courses`}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 px-10 py-5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 font-bold uppercase tracking-widest rounded-md cursor-pointer text-sm transition-colors"
                  >
                    {t.viewAllCourses}
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </article>
    </>
  );
}
