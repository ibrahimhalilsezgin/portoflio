import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: "İbrahim Halil Sezgin | Full Stack Developer & Portfolio",
  description: "İbrahim Halil Sezgin resmi kişisel web sitesi ve portfolyosu. Projeler, yazılım geliştirme çalışmaları ve iletişim bilgileri.",
  keywords: ["İbrahim Halil Sezgin", "Full-Stack Developer", "Next.js", "TypeScript", "Node.js", "wBox.me", "Jetconnect"],
  authors: [{ name: "İbrahim Halil Sezgin" }],
  openGraph: {
    title: "İbrahim Halil Sezgin | Full Stack Developer & Portfolio",
    description: "İbrahim Halil Sezgin resmi kişisel web sitesi ve portfolyosu. Projeler, yazılım geliştirme çalışmaları ve iletişim bilgileri.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-ink scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "İbrahim Halil Sezgin",
              "url": "https://ibrahimhalilsezgin.com", 
              "jobTitle": "Yazılım Geliştirici",
              "sameAs": [
                "https://github.com/ibrahimhalilsezgin",
                "https://linkedin.com/in/ibrahimhalilsezgin",
                "https://x.com/ihsezgin"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${mono.variable} antialiased text-slate-800 dark:text-gray-200 transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}

