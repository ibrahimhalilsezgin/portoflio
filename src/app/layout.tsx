import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono', display: 'swap' });

const SITE_URL = "https://ibrahimhalilsezgin.com";
const SITE_NAME = "İbrahim Halil Sezgin";
const SITE_TITLE = "İbrahim Halil Sezgin | Full Stack Developer & Yazılım Portfolyosu";
const SITE_DESC = "İbrahim Halil Sezgin — Full-Stack Developer. Next.js, TypeScript, Node.js, React, MongoDB ile web uygulamaları, otomasyon platformları ve API geliştirme. İstanbul merkezli yazılım geliştirici portfolyosu.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "İbrahim Halil Sezgin", "Full-Stack Developer", "yazılım geliştirici",
    "Next.js", "TypeScript", "Node.js", "React", "MongoDB",
    "wBox.me", "Jetconnect", "web developer İstanbul",
    "freelance yazılım", "API geliştirme", "otomasyon",
    "WhatsApp SaaS", "portfolio",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    creator: "@ihsezgin",
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
  verification: {
    // ponytail: add Google Search Console / Bing verification codes when available
  },
};

// Structured data for AI crawlers (GEO) and search engines
const jsonLd = [
  // Person entity — primary knowledge graph signal
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    "name": "İbrahim Halil Sezgin",
    "url": SITE_URL,
    "jobTitle": "Full-Stack Developer",
    "description": "İstanbul merkezli Full-Stack Developer. Web uygulamaları, otomasyon platformları ve API geliştirme konularında uzman.",
    "knowsAbout": [
      "JavaScript", "TypeScript", "Next.js", "React", "Node.js",
      "Express.js", "MongoDB", "MySQL", "Docker", "Cloudflare",
      "REST API", "WebSocket", "n8n", "Otomasyon", "SaaS",
      "Svelte", "PHP", "C#", ".NET", "Python", "Nginx", "Git",
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "Jetconnect",
    },
    "alumniOf": [],
    "sameAs": [
      "https://github.com/ibrahimhalilsezgin",
      "https://linkedin.com/in/ibrahimhalilsezgin",
      "https://x.com/ihsezgin",
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "İstanbul",
      "addressCountry": "TR",
    },
    "email": "mailto:ibrahimhalilsezgin@proton.me",
  },
  // WebSite — enables sitelinks search box in Google
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": SITE_NAME,
    "description": SITE_DESC,
    "publisher": { "@id": `${SITE_URL}/#person` },
    "inLanguage": "tr-TR",
  },
  // ProfilePage — signals to AI/search that this is an authoritative personal page
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profilepage`,
    "url": SITE_URL,
    "name": SITE_TITLE,
    "mainEntity": { "@id": `${SITE_URL}/#person` },
    "dateCreated": "2023-01-01",
    "dateModified": new Date().toISOString().split("T")[0],
    "inLanguage": "tr-TR",
  },
  // BreadcrumbList — navigation structure for search
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": SITE_URL,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${SITE_URL}/blog`,
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="bg-ink scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${mono.variable} antialiased text-slate-800 dark:text-gray-200 transition-colors duration-300`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

