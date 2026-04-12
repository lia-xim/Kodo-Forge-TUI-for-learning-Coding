"use client";

import { motion } from "framer-motion";
import { Download, Monitor, Apple, Terminal, Code2, Shield, Zap, HardDrive } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const platforms = [
  {
    name: "Windows",
    icon: <Monitor size={32} />,
    file: "kodo-forge.exe",
    size: "~35 MB",
    note: "Windows 10/11 (x64)",
    primary: true,
  },
  {
    name: "macOS",
    icon: <Apple size={32} />,
    file: "kodo-forge-mac",
    size: "~33 MB",
    note: "Apple Silicon (M1+)",
    primary: false,
  },
  {
    name: "Linux",
    icon: <Terminal size={32} />,
    file: "kodo-forge-linux",
    size: "~34 MB",
    note: "x64, glibc 2.31+",
    primary: false,
  },
];

interface DownloadPageProps {
  dict: Record<string, any>;
  lang: string;
}

export default function DownloadPage({ dict, lang }: DownloadPageProps) {
  const t = dict.downloadPage;

  const trustSignals = [
    {
      icon: <Shield size={24} />,
      title: t.noInstall,
      desc: t.noInstallDesc,
    },
    {
      icon: <HardDrive size={24} />,
      title: t.portable,
      desc: t.portableDesc,
    },
    {
      icon: <Zap size={24} />,
      title: t.instantBoot,
      desc: t.instantBootDesc,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t.title}<span className="text-[#FFB000]">{t.titleHighlight}</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          {t.subtitle}
        </p>
      </motion.div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {platforms.map((p, i) => (
          <motion.div
            key={p.name}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
            variants={fadeUp}
          >
            <motion.a
              href="#"
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(255,176,0,0.15)" }}
              whileTap={{ scale: 0.97 }}
              className={`block retro-glass rounded-lg p-8 text-center transition-all cursor-pointer ${
                p.primary ? "border-[#FFB000]/30" : ""
              }`}
            >
              <div className="flex justify-center mb-4 text-[#FFB000]">{p.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
              <p className="text-xs text-zinc-500 mb-4">{p.note}</p>

              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FFB000]/10 border border-[#FFB000]/20 rounded text-[#FFB000] font-bold text-sm uppercase tracking-wider mb-3">
                <Download size={16} /> {p.file}
              </div>

              <p className="text-xs text-zinc-600">{p.size}</p>
            </motion.a>
          </motion.div>
        ))}
      </div>

      {/* Alternative: Source */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={0}
        variants={fadeUp}
        className="retro-glass rounded-lg p-8 mb-16"
      >
        <div className="flex items-center gap-3 mb-4">
          <Code2 size={20} className="text-[#FFB000]" />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.buildFromSource}
          </h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          {t.buildDesc}
        </p>
        <div className="retro-glass rounded-lg p-5 font-mono text-sm space-y-1">
          <p className="text-zinc-500"># Clone the repository</p>
          <p className="text-zinc-300">git clone https://github.com/lia-xim/Learning.git</p>
          <p className="text-zinc-300">cd Learning/platform</p>
          <p className="text-zinc-300 mt-2">npm install</p>
          <p className="text-zinc-300">npm start</p>
        </div>
      </motion.div>

      {/* Trust Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trustSignals.map((item, i) => (
          <motion.div
            key={item.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
            variants={fadeUp}
            className="text-center"
          >
            <div className="text-[#FFB000] flex justify-center mb-3">{item.icon}</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">{item.title}</h3>
            <p className="text-xs text-zinc-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Docs link */}
      <div className="text-center mt-16">
        <p className="text-sm text-zinc-500">
          {t.needHelp}{" "}
          <Link href={`/${lang}/docs`} className="text-[#FFB000] hover:underline">
            {t.readDocs}
          </Link>
        </p>
      </div>
    </div>
  );
}
