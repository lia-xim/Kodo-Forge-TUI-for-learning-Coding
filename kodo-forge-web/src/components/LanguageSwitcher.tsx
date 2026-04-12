'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const localeLabels: Record<string, string> = {
  en: 'EN',
  de: 'DE',
};

const localeFlags: Record<string, string> = {
  en: 'EN',
  de: 'DE',
};

interface LanguageSwitcherProps {
  lang: string;
}

export default function LanguageSwitcher({ lang }: LanguageSwitcherProps) {
  const pathname = usePathname();

  // Determine the other locale to switch to
  const otherLocale = lang === 'en' ? 'de' : 'en';

  // Replace the locale segment in the current path
  // pathname looks like /en/courses or /de/docs
  const switchedPath = pathname.replace(
    new RegExp(`^/${lang}(?=/|$)`),
    `/${otherLocale}`
  );

  return (
    <Link
      href={switchedPath}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium uppercase tracking-wider border border-zinc-700/60 bg-zinc-900/50 text-zinc-400 hover:text-[#FFB000] hover:border-[#FFB000]/40 transition-all duration-200"
      title={`Switch to ${localeLabels[otherLocale]}`}
    >
      <span className="text-[10px]">{localeFlags[otherLocale]}</span>
      <span>{localeLabels[otherLocale]}</span>
    </Link>
  );
}
