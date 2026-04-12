'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Terminal, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  lang: string;
  dict: Record<string, any>;
}

export default function Navbar({ lang, dict }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = dict.nav;

  const links = [
    { href: `/${lang}`, label: nav.home },
    { href: `/${lang}/courses`, label: nav.courses },
    { href: `/${lang}/docs`, label: nav.docs },
    { href: `/${lang}/create`, label: nav.createCourse },
    { href: `/${lang}/download`, label: nav.download },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-3 group">
          <Terminal
            className="text-[#FFB000] group-hover:rotate-12 transition-transform"
            size={22}
          />
          <span className="font-bold text-white tracking-widest text-sm uppercase">
            Kodo<span className="text-[#FFB000]">Forge</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== `/${lang}` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[#FFB000]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-px bg-[#FFB000] shadow-[0_0_8px_#FFB000]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side: Language Switcher + GitHub CTA */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher lang={lang} />
          <a
            href="https://github.com/lia-xim/Learning"
            target="_blank"
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-[#FFB000] transition-colors uppercase tracking-wider"
          >
            {nav.starOnGithub}
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-zinc-400 hover:text-white"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-zinc-800/60 bg-[#09090b]/95 backdrop-blur-md"
          >
            <div className="flex flex-col p-4 gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded text-sm font-medium uppercase tracking-wider ${
                    pathname === link.href
                      ? 'text-[#FFB000] bg-zinc-900'
                      : 'text-zinc-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 py-3">
                <LanguageSwitcher lang={lang} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
