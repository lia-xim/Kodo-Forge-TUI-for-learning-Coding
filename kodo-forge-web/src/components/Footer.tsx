import Link from "next/link";
import { Terminal, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-[#09090b] mt-32">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="text-[#FFB000]" size={20} />
              <span className="font-bold text-white tracking-widest text-sm uppercase">
                Kodo<span className="text-[#FFB000]">Forge</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              A zero-dependency terminal learning environment built for deep-focus mastery.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4">Courses</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses/typescript" className="text-zinc-500 hover:text-[#FFB000] transition-colors">TypeScript Deep Learning</Link></li>
              <li><Link href="/courses/angular" className="text-zinc-500 hover:text-[#FFB000] transition-colors">Angular Mastery</Link></li>
              <li><Link href="/courses/react" className="text-zinc-500 hover:text-[#FFB000] transition-colors">React mit TypeScript</Link></li>
              <li><Link href="/courses/nextjs" className="text-zinc-500 hover:text-[#FFB000] transition-colors">Next.js Production</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="text-zinc-500 hover:text-[#FFB000] transition-colors">Documentation</Link></li>
              <li><Link href="/docs#create-content" className="text-zinc-500 hover:text-[#FFB000] transition-colors">Create Your Own Course</Link></li>
              <li><Link href="/download" className="text-zinc-500 hover:text-[#FFB000] transition-colors">Download</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/lia-xim/Learning" target="_blank" className="text-zinc-500 hover:text-[#FFB000] transition-colors flex items-center gap-2">
                  <Code2 size={14} /> GitHub Repository
                </a>
              </li>
              <li><a href="https://github.com/lia-xim/Learning/issues" target="_blank" className="text-zinc-500 hover:text-[#FFB000] transition-colors">Report a Bug</a></li>
              <li><a href="https://github.com/lia-xim/Learning/blob/master/LICENSE" target="_blank" className="text-zinc-500 hover:text-[#FFB000] transition-colors">MIT License</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600 font-mono">
            © 2026 KODO_FORGE // v1.0.0 // SYSTEM_NOMINAL
          </p>
          <p className="text-xs text-zinc-700 font-mono animate-pulse">
            ▮ TERMINAL_LINK_ACTIVE
          </p>
        </div>
      </div>
    </footer>
  );
}
