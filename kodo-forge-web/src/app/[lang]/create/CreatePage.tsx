"use client";

import { motion } from "framer-motion";
import { FolderOpen, PlusSquare, Brain, Terminal, FileCode2, Command, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";
import { githubRepo } from "@/lib/github";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

interface CreatePageProps {
  dict: {
    createPage: {
      title: string;
      titleHighlight: string;
      subtitle: string;
      howItWorks: string;
      howItWorksP1: string;
      howItWorksP2: string;
      howItWorksP3: string;
      dirStructure: string;
      creatorExperience: string;
      writeMarkdown: string;
      writeMarkdownDesc: string;
      terminalNative: string;
      terminalNativeDesc: string;
      annotatedCode: string;
      annotatedCodeDesc: string;
      aiTitle: string;
      aiDesc: string;
      viewTutorial: string;
      getAiWorkflow: string;
    };
  };
  lang: string;
}

export default function CreatePage({ dict, lang }: CreatePageProps) {
  const t = dict.createPage;

  const features = [
    {
      icon: <FileCode2 size={24} />,
      title: t.writeMarkdown,
      desc: t.writeMarkdownDesc,
    },
    {
      icon: <Command size={24} />,
      title: t.terminalNative,
      desc: t.terminalNativeDesc,
    },
    {
      icon: <Sparkles size={24} />,
      title: t.annotatedCode,
      desc: t.annotatedCodeDesc,
    },
  ];

  return (
    <article className="min-h-screen py-20 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Terminal size={24} className="text-[#FFB000]" />
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.title}<span className="text-[#FFB000]">{t.titleHighlight}</span>
          </h1>
        </div>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </motion.div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 items-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.howItWorks}
          </h2>
          <div className="space-y-6 text-zinc-400 leading-relaxed">
            <p dangerouslySetInnerHTML={{
              __html: t.howItWorksP1.replace(
                /<code>(.*?)<\/code>/g,
                '<code class="text-[#FFB000] bg-zinc-800/50 px-2 py-0.5 rounded font-mono text-sm">$1</code>'
              ),
            }} />
            <p dangerouslySetInnerHTML={{
              __html: t.howItWorksP2.replace(
                /<code>(.*?)<\/code>/g,
                '<code class="text-zinc-300 font-mono text-sm">$1</code>'
              ),
            }} />
            <p>{t.howItWorksP3}</p>
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="retro-glass rounded-lg border border-zinc-800/80 p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800/60 pb-3">
            <FolderOpen size={16} className="text-[#FFB000]" />
            <span className="text-xs font-mono text-zinc-400 tracking-wider">{t.dirStructure}</span>
          </div>
          <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
<span className="text-zinc-500">my-course/</span>
{`├── `}<span className="text-green-400">platform.json</span>
{`└── `}<span className="text-blue-400">01-getting-started/</span>
{`    ├── `}<span className="text-green-400">README.md</span> <span className="text-zinc-600 italic"># Lesson metadata</span>
{`    └── `}<span className="text-blue-400">sections/</span>
{`        ├── 01-intro.md
        ├── 02-setup.md
        └── 03-first-code.md`}
          </pre>
        </motion.div>
      </section>

      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.creatorExperience}
          </h2>
          <div className="w-16 h-1 bg-[#FFB000] mx-auto rounded-full shadow-[0_0_10px_#FFB000]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="retro-glass p-8 rounded-lg group">
              <div className="text-[#FFB000] mb-4 group-hover:scale-110 origin-left transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="retro-glass rounded-xl p-8 sm:p-12 border border-[#FFB000]/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB000] rounded-full blur-[150px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFB000] rounded-full blur-[150px] opacity-10 pointer-events-none" />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="relative z-10">
          <Brain size={48} className="mx-auto text-[#FFB000] mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.aiTitle}
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8 text-lg">
            {t.aiDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${lang}/docs#create-content`}>
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-[#FFB000] text-[#09090b] font-bold uppercase tracking-widest rounded-sm cursor-pointer hover:bg-amber-400 transition-colors">
                <HelpCircle size={18} /> {t.viewTutorial}
              </div>
            </Link>
            <a href={githubRepo.workflowUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 retro-glass text-white font-bold uppercase tracking-widest rounded-sm cursor-pointer hover:bg-zinc-800/40 transition-colors border border-zinc-700/50">
              <PlusSquare size={18} /> {t.getAiWorkflow}
            </a>
          </div>
        </motion.div>
      </section>
    </article>
  );
}
