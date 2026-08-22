import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: "Ibrahim Halil Sezgin — Full-Stack Developer",
  description: "Portfolio of Ibrahim Halil Sezgin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#080a10] scroll-smooth">
      <body className={`${inter.variable} ${mono.variable} antialiased text-gray-200 bg-ink`}>
        {/* Simple Navbar for now */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl bg-surface/80 backdrop-blur-md border border-line rounded-full px-6 py-3 flex justify-between items-center shadow-2xl">
            <div className="flex gap-8 text-xs uppercase tracking-widest">
                <a href="#projects" className="relative nav-link text-brand"><span className="mr-1">●</span>Projects</a>
                <a href="#about" className="relative nav-link">About</a>
                <a href="/admin" className="relative nav-link text-gray-500">Admin</a>
            </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
