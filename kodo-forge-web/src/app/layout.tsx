import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE_URL = "https://kodoforge.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Kodo Forge — Free Terminal Learning Platform for TypeScript, React & Angular",
    template: "%s | Kodo Forge",
  },
  description:
    "Kodo Forge is a free, open-source terminal learning platform (TUI) for mastering TypeScript, Angular, React, and Next.js. 144+ lessons, spaced repetition, kinetic reading, and gamified progress tracking — 100% offline, zero dependencies.",
  keywords: [
    "learn TypeScript",
    "TypeScript tutorial",
    "TypeScript course free",
    "terminal learning platform",
    "TUI learning",
    "learn coding in terminal",
    "Angular course",
    "React course",
    "Next.js course",
    "offline learning platform",
    "command line tutorial",
    "spaced repetition coding",
    "open source learning",
    "free coding course",
    "learn programming offline",
    "web development course",
    "TypeScript deep learning",
    "coding without distractions",
    "developer education",
    "Kodo Forge",
  ],
  authors: [{ name: "lia-xim", url: "https://github.com/lia-xim" }],
  creator: "lia-xim",
  publisher: "Kodo Forge",
  openGraph: {
    title: "Kodo Forge — Free Terminal Learning Platform",
    description:
      "Master TypeScript, React, Angular & Next.js from your terminal. 144+ lessons, zero dependencies, 100% offline. Free and open source.",
    type: "website",
    locale: "en_US",
    siteName: "Kodo Forge",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kodo Forge — Learn to Code in Your Terminal",
    description:
      "A free, open-source TUI platform for mastering web development. 144+ lessons, spaced repetition, 100% offline.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: BASE_URL },
  category: "education",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kodo Forge",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Windows, macOS, Linux",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "A free, open-source terminal learning platform for mastering TypeScript, Angular, React, and Next.js with 144+ lessons, spaced repetition, and gamified progress tracking.",
  url: BASE_URL,
  downloadUrl: `${BASE_URL}/download`,
  softwareVersion: "1.0.0",
  author: {
    "@type": "Person",
    name: "lia-xim",
    url: "https://github.com/lia-xim",
  },
  license: "https://opensource.org/licenses/MIT",
  featureList: [
    "144+ interactive lessons",
    "Spaced repetition system",
    "Kinetic reading engine",
    "100% offline",
    "Zero dependencies",
    "Gamified progress tracking",
    "TypeScript, Angular, React, Next.js courses",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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

        <Navbar />
        <main className="relative z-10 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
