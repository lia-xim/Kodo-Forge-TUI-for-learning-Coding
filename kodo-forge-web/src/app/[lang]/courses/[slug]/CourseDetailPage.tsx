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
} from "lucide-react";
import { Course, courses } from "@/data/courses";
import { useState } from "react";
import Script from "next/script";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

interface CourseDetailPageProps {
  course: Course;
  dict: Record<string, any>;
  lang: string;
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

  const curriculumMeta = t.curriculumMeta
    .replace("{lessons}", String(course.totalLessons))
    .replace("{phases}", String(course.phases.length))
    .replace("{sections}", String(course.totalSections))
    .replace("{hours}", String(course.estimatedHours));

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
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image src={course.image} alt={`${course.name} terminal course`} fill className="object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/50 to-[#09090b]" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
            <Link
              href={`/${lang}/courses`}
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#FFB000] mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> {t.allCourses}
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {course.status === "active" && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 font-bold uppercase">
                    {t.availableNow}
                  </span>
                )}
                {course.status === "planned" && (
                  <span className="px-3 py-1 bg-zinc-500/20 border border-zinc-500/30 rounded text-xs text-zinc-400 font-bold uppercase">
                    {t.comingSoon}
                  </span>
                )}
                {prereqCourse && (
                  <span className="text-xs text-zinc-500">
                    {t.requires}:{" "}
                    <Link href={`/${lang}/courses/${prereqCourse.slug}`} className="text-[#FFB000] hover:underline">
                      {prereqCourse.name}
                    </Link>
                  </span>
                )}
              </div>

              <h1
                className="text-4xl sm:text-6xl font-bold mb-3"
                style={{ color: course.color, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {course.name}
              </h1>
              <p className="text-lg text-zinc-400 max-w-2xl mb-8">{tagline}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 mb-10">
                <span className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#FFB000]" /> {course.totalLessons} {dict.common.lessons}
                </span>
                <span className="flex items-center gap-2">
                  <Layers size={16} className="text-[#FFB000]" /> {course.totalSections} {dict.common.sections}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-[#FFB000]" /> ~{course.estimatedHours}h {dict.common.content}
                </span>
                <span className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-[#FFB000]" /> {course.phases.length} {dict.common.phases}
                </span>
              </div>

              <Link href={`/${lang}/download`}>
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${course.glowColor}` }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-widest rounded-sm cursor-pointer border transition-all"
                  style={{
                    color: course.color,
                    borderColor: `${course.color}40`,
                    background: `${course.color}10`,
                  }}
                >
                  <Download size={18} /> {t.startFree}
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Screenshots Gallery */}
        {course.screenshots && course.screenshots.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-12 -mt-16 relative z-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {course.screenshots.map((src, i) => (
                <div key={i} className="retro-glass rounded-lg overflow-hidden border border-zinc-800/80 shadow-2xl relative aspect-[16/9] group">
                  <Image
                    src={src}
                    alt={`${course.name} Platform Screenshot ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#09090b]/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Long Description (if available) */}
        {longDescription && (
          <section className="max-w-5xl mx-auto px-6 py-16" aria-label="Course overview">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <h2
                className="text-2xl font-bold text-white mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {t.aboutCourse}
              </h2>
              <div className="space-y-4">
                {longDescription.split("\n\n").map((p: string, i: number) => (
                  <p key={i} className="text-zinc-400 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Target Audience */}
        {targetAudience && (
          <section className="max-w-5xl mx-auto px-6 py-12" aria-label="Target audience">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <div className="flex items-center gap-3 mb-6">
                <Users size={20} className="text-[#FFB000]" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {t.targetAudience}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {targetAudience.map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={fadeUp}
                    className="flex items-start gap-3 retro-glass rounded-lg p-4"
                    style={{ borderColor: `${course.color}15` }}
                  >
                    <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* What You'll Learn */}
        {whatYouLearn && (
          <section className="max-w-5xl mx-auto px-6 py-16 border-y border-zinc-800/40" aria-label="Learning outcomes">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {t.whatYouLearn}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {whatYouLearn.map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={fadeUp}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 size={16} style={{ color: course.color }} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Didactic Highlights */}
        {didacticHighlights && (
          <section className="max-w-5xl mx-auto px-6 py-16" aria-label="Didactic approach">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <div className="flex items-center gap-3 mb-8">
                <Lightbulb size={20} className="text-[#FFB000]" />
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {t.didacticConcept}
                </h2>
              </div>
              <p className="text-zinc-400 mb-8 max-w-2xl">
                {t.didacticDesc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {didacticHighlights.map((h: { title: string; description: string }, i: number) => (
                  <motion.div
                    key={h.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={fadeUp}
                    className="retro-glass retro-glass-hover rounded-lg p-5 flex flex-col gap-2"
                    style={{ borderColor: `${course.color}15` }}
                  >
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{h.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{h.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Topics */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.coveredTopics}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {course.topics.map((topic, i) => (
              <motion.div
                key={topic}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="retro-glass px-4 py-3 rounded text-sm text-zinc-300 text-center"
                style={{ borderColor: `${course.color}15` }}
              >
                {topic}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Curriculum Accordion */}
        <section className="max-w-5xl mx-auto px-6 py-16" aria-label="Full curriculum">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.fullCurriculum}
          </h2>
          <p className="text-sm text-zinc-500 mb-8">
            {curriculumMeta}
          </p>

          <div className="space-y-3">
            {course.phases.map((phase, pi) => (
              <motion.div
                key={phase.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={pi}
                variants={fadeUp}
                className="retro-glass rounded-lg overflow-hidden"
                style={{ borderColor: `${course.color}15` }}
              >
                <button
                  onClick={() => setOpenPhase(openPhase === pi ? -1 : pi)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="text-xl font-black opacity-30"
                      style={{ color: course.color, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {String(pi + 1).padStart(2, "0")}
                    </span>
                    <span className="font-bold text-white">{phase.name}</span>
                    <span className="text-xs text-zinc-500">{phase.lessons.length} {dict.common.lessons}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-zinc-500 transition-transform ${openPhase === pi ? "rotate-180" : ""}`}
                  />
                </button>

                {openPhase === pi && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-zinc-800/40"
                  >
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.lessons.map((lesson, li) => (
                        <div key={li} className="flex items-center gap-3 text-sm text-zinc-400 py-1.5">
                          <span className="text-xs font-mono text-zinc-600 w-6 text-right">
                            {String(li + 1).padStart(2, "0")}
                          </span>
                          <span>{lesson}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center" aria-label="Start learning">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.readyToStart}<span style={{ color: course.color }}>{course.name}</span>{t.readyToStart2}
          </h2>
          <p className="text-zinc-500 mb-8">
            {t.downloadCta}
          </p>
          <Link href={`/${lang}/download`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#FFB000] text-[#09090b] font-bold uppercase tracking-widest rounded-sm cursor-pointer text-lg"
            >
              <Download size={20} /> {t.downloadFree}
            </motion.div>
          </Link>
        </section>
      </article>
    </>
  );
}
