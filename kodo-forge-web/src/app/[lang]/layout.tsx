import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from './dictionaries';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../../globals.css';

const BASE_URL = 'https://kodoforge.dev';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'de' }];
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) return {};

  const dict = await getDictionary(lang);

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: dict.meta.title,
      template: '%s | Kodo Forge',
    },
    description: dict.meta.description,
    keywords: [
      'learn TypeScript',
      'TypeScript tutorial',
      'TypeScript course free',
      'terminal learning platform',
      'TUI learning',
      'learn coding in terminal',
      'Angular course',
      'React course',
      'Next.js course',
      'offline learning platform',
      'command line tutorial',
      'spaced repetition coding',
      'open source learning',
      'free coding course',
      'learn programming offline',
      'web development course',
      'TypeScript deep learning',
      'coding without distractions',
      'developer education',
      'Kodo Forge',
    ],
    authors: [{ name: 'lia-xim', url: 'https://github.com/lia-xim' }],
    creator: 'lia-xim',
    publisher: 'Kodo Forge',
    openGraph: {
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      type: 'website',
      locale: lang === 'de' ? 'de_DE' : 'en_US',
      siteName: 'Kodo Forge',
      url: `${BASE_URL}/${lang}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.twitterTitle,
      description: dict.meta.twitterDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${BASE_URL}/${lang}`,
      languages: {
        en: '/en',
        de: '/de',
        'x-default': '/en',
      },
    },
    category: 'education',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Kodo Forge',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: dict.meta.description,
    url: `${BASE_URL}/${lang}`,
    downloadUrl: `${BASE_URL}/${lang}/download`,
    softwareVersion: '1.0.0',
    inLanguage: lang,
    author: {
      '@type': 'Person',
      name: 'lia-xim',
      url: 'https://github.com/lia-xim',
    },
    license: 'https://opensource.org/licenses/MIT',
    featureList: [
      '144+ interactive lessons',
      'Spaced repetition system',
      'Kinetic reading engine',
      '100% offline',
      'Zero dependencies',
      'Gamified progress tracking',
      'TypeScript, Angular, React, Next.js courses',
    ],
  };

  return (
    <html lang={lang} className="scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen relative bg-[#09090b] text-zinc-300 selection:bg-amber-500/20 selection:text-amber-300">
        {/* CRT Scanlines */}
        <div className="crt-overlay" />

        {/* Ambient background glow */}
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-[#FFB000]/[0.02] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-[#FFB000]/[0.015] rounded-full blur-[100px]" />
        </div>

        <Navbar lang={lang} dict={dict} />
        <main className="relative z-10 pt-16">{children}</main>
        <Footer lang={lang} dict={dict} />
      </body>
    </html>
  );
}
