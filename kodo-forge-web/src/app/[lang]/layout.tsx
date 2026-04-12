import { notFound } from 'next/navigation';
import { JetBrains_Mono, IBM_Plex_Sans } from 'next/font/google';
import { getDictionary, hasLocale } from './dictionaries';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../../globals.css';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '700'],
});

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

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
    keywords:
      lang === 'de'
        ? [
            'TypeScript Tutorial',
            'TypeScript im Terminal lernen',
            'TypeScript Kurs kostenlos',
            'Angular Kurs',
            'React Kurs',
            'Next.js Kurs',
            'Open Source TypeScript Kurs',
            'Spaced Repetition Programmieren',
            'CLI Lernplattform',
            'Offline Programmierkurs',
          ]
        : [
            'TypeScript tutorial',
            'learn TypeScript terminal',
            'TypeScript course free',
            'Angular course',
            'React course',
            'Next.js course',
            'open source TypeScript course',
            'spaced repetition coding',
            'CLI learning platform',
            'offline programming course',
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
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Kodo Forge',
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        sameAs: ['https://github.com/lia-xim'],
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'Kodo Forge',
        publisher: { '@id': `${BASE_URL}/#organization` },
        inLanguage: ['en', 'de'],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${BASE_URL}/#app`,
        name: 'Kodo Forge',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Windows, macOS, Linux',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE_URL}/${lang}/#courses`,
        itemListElement: [
          {
            '@type': 'Course',
            name: 'TypeScript Deep Learning',
            description: '44-lesson TypeScript mastery course in the terminal',
            provider: { '@id': `${BASE_URL}/#organization` },
            url: `${BASE_URL}/${lang}/courses/typescript`,
          },
          {
            '@type': 'Course',
            name: 'Angular Deep Learning',
            provider: { '@id': `${BASE_URL}/#organization` },
            url: `${BASE_URL}/${lang}/courses/angular`,
          },
          {
            '@type': 'Course',
            name: 'React Deep Learning',
            provider: { '@id': `${BASE_URL}/#organization` },
            url: `${BASE_URL}/${lang}/courses/react`,
          },
          {
            '@type': 'Course',
            name: 'Next.js Deep Learning',
            provider: { '@id': `${BASE_URL}/#organization` },
            url: `${BASE_URL}/${lang}/courses/nextjs`,
          },
        ],
      },
    ],
  };

  return (
    <html
      lang={lang}
      className={`scroll-smooth dark ${mono.variable} ${sans.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen relative bg-[#0b0b0d] text-zinc-300 selection:bg-amber-500/20 selection:text-amber-300">
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
