import Link from 'next/link';
import { Code2 } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { githubRepo } from '@/lib/github';

interface FooterProps {
  lang: string;
  dict: {
    footer: {
      brandDescription: string;
      coursesTitle: string;
      coursesLinks: {
        typescript: string;
        angular: string;
        react: string;
        nextjs: string;
      };
      resourcesTitle: string;
      resourcesLinks: {
        documentation: string;
        createCourse: string;
        download: string;
      };
      communityTitle: string;
      communityLinks: {
        github: string;
        bugs: string;
        license: string;
      };
      copyright: string;
      terminalStatus: string;
    };
  };
}

export default function Footer({ lang, dict }: FooterProps) {
  const footer = dict.footer;

  return (
    <footer className="border-t border-amber-500/25 bg-zinc-950 mt-32">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <BrandLogo
                variant="mark"
                alt="Kodo Forge icon"
                className="h-10 w-10 shrink-0"
              />
              <span className="font-bold text-white tracking-widest text-sm uppercase">
                Kodo<span className="text-[#FFB000]">Forge</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {footer.brandDescription}
            </p>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4">
              {footer.coursesTitle}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${lang}/courses/typescript`}
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.coursesLinks.typescript}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/courses/angular`}
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.coursesLinks.angular}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/courses/react`}
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.coursesLinks.react}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/courses/nextjs`}
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.coursesLinks.nextjs}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4">
              {footer.resourcesTitle}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${lang}/docs`}
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.resourcesLinks.documentation}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/docs#create-content`}
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.resourcesLinks.createCourse}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/download`}
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.resourcesLinks.download}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-widest mb-4">
              {footer.communityTitle}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={githubRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors flex items-center gap-2"
                >
                  <Code2 size={14} /> {footer.communityLinks.github}
                </a>
              </li>
              <li>
                <a
                  href={githubRepo.issuesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.communityLinks.bugs}
                </a>
              </li>
              <li>
                <a
                  href={githubRepo.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-[#FFB000] transition-colors"
                >
                  {footer.communityLinks.license}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-amber-500/15 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600 font-mono">
            {footer.copyright}
          </p>
          <p className="text-xs text-zinc-700 font-mono animate-pulse">
            {footer.terminalStatus}
          </p>
        </div>
      </div>
    </footer>
  );
}
