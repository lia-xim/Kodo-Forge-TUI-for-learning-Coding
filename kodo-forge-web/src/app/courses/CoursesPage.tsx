"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen, Layers } from "lucide-react";
import { courses } from "@/data/courses";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function CoursesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
        <h1
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Course <span className="text-[#FFB000]">Catalog</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl text-lg">
          A structured learning path from TypeScript fundamentals to full-stack framework mastery.
          Each course is designed for the terminal — no browser needed.
        </p>
      </motion.div>

      {/* Learning Path visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-20"
      >
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">
          Recommended Learning Path
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {courses.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3">
              <Link
                href={`/courses/${c.slug}`}
                className="px-4 py-2 rounded retro-glass text-sm font-bold transition-all hover:shadow-lg"
                style={{
                  color: c.color,
                  borderColor: `${c.color}30`,
                }}
              >
                {c.name}
              </Link>
              {i < courses.length - 1 && (
                <ArrowRight size={16} className="text-zinc-600" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Course Cards */}
      <div className="space-y-8">
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
              <div className="retro-glass retro-glass-hover rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-[300px_1fr] group cursor-pointer">
                {/* Image */}
                <div className="relative h-60 lg:h-full overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#09090b]/80 hidden lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 to-transparent lg:hidden" />
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <h3
                      className="text-2xl font-bold group-hover:text-[#FFB000] transition-colors"
                      style={{ color: course.color, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {course.name}
                    </h3>
                    {course.status === "active" && (
                      <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-400 font-bold uppercase">
                        Active
                      </span>
                    )}
                    {course.status === "planned" && (
                      <span className="px-2 py-0.5 bg-zinc-500/20 border border-zinc-500/30 rounded text-[10px] text-zinc-400 font-bold uppercase">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-5 max-w-lg">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-zinc-500 mb-5">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} /> {course.totalLessons} Lessons
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers size={14} /> {course.totalSections} Sections
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {course.estimatedHours}h
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-5">
                    {course.topics.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 text-[10px] rounded bg-zinc-800/60 text-zinc-400 uppercase tracking-wider"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {course.prerequisite && (
                    <p className="text-xs text-zinc-600">
                      Prerequisite:{" "}
                      <span className="text-zinc-400">
                        {courses.find((c) => c.id === course.prerequisite)?.name}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
