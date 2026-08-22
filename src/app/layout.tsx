import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: "Ibrahim Halil Sezgin — Full-Stack Developer",
  description: "Portfolio of Ibrahim Halil Sezgin, Full-Stack Developer specializing in web apps, SaaS, REST APIs, and automation.",
  keywords: ["Ibrahim Halil Sezgin", "Full-Stack Developer", "Next.js", "TypeScript", "Node.js", "wBox.me", "Jetconnect"],
  authors: [{ name: "Ibrahim Halil Sezgin" }],
  openGraph: {
    title: "Ibrahim Halil Sezgin — Full-Stack Developer",
    description: "Portfolio of Ibrahim Halil Sezgin, Full-Stack Developer specializing in web apps, SaaS, REST APIs, and automation.",
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
      <body className={`${inter.variable} ${mono.variable} antialiased text-slate-800 dark:text-gray-200 transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}

