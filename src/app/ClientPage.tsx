'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import OrbitImages from '@/components/OrbitImages';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack';
import NativeTypingHeader from '@/components/NativeTypingHeader';
import ScrollReveal from '@/components/ScrollReveal';
import {
  Layers,
  User,
  Briefcase,
  Code,
  TrendingUp,
  Menu,
  X,
  Moon,
  Sun,
  Coffee,
  Mail,
  ArrowRight,
  ExternalLink,
  Users,
  GitBranch,
  Star
} from 'lucide-react';

const SplashCursor = dynamic(() => import('@/components/SplashCursor'), {
  ssr: false,
});

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function ClientPage({ profile, experiences, projects, comments = [] }: { profile: any, experiences: any[], projects: any[], comments?: any[] }) {
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [ghStats, setGhStats] = useState<any>({});
  const [theme, setTheme] = useState('light');
  const [time, setTime] = useState('');

  const [commentForm, setCommentForm] = useState({ name: '', role: '', content: '' });
  const [commentStatus, setCommentStatus] = useState({ loading: false, message: '', error: '' });
  const [currentCommentIdx, setCurrentCommentIdx] = useState(0);

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Theme setup
    const storedTheme = localStorage.getItem('theme');
    const isDark = storedTheme === 'dark';
    
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    
    // Observer for reveal
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));

    // Fetch GH stats silently
    if (profile.githubUsername) {
      fetch(`https://api.github.com/users/${profile.githubUsername}`)
        .then(r => r.json())
        .then(d => {
          if (d && !d.message) setGhStats(d);
        })
        .catch(() => {});
    }

    return () => observer.disconnect();
  }, [profile.githubUsername]);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      html.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentStatus({ loading: true, message: '', error: '' });
    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      });
      if (res.ok) {
        setCommentStatus({ loading: false, message: 'Yorumunuz başarıyla gönderildi ve onay sırasına alındı. Teşekkürler!', error: '' });
        setCommentForm({ name: '', role: '', content: '' });
      } else {
        throw new Error('Göderilirken hata oluştu');
      }
    } catch (err: any) {
      setCommentStatus({ loading: false, message: '', error: err.message });
    }
  };

  const nextComment = () => setCurrentCommentIdx((prev) => (prev + 1) % comments.length);
  const prevComment = () => setCurrentCommentIdx((prev) => (prev - 1 + comments.length) % comments.length);

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.categories?.includes(filter));

  return (
    <>
    {/* SplashCursor Desktop & Mobile */}
    <div className="fixed inset-0 z-0 pointer-events-none">
      <SplashCursor />
    </div>

    {/* Content Wrapper */}
    <div className="relative z-10 pointer-events-auto">

    {/* Navigation */}
    <nav id="mainNav" className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-7xl bg-surface/90 backdrop-blur-md border border-line rounded-2xl md:rounded-full px-4 md:px-6 py-3 flex flex-wrap justify-between items-center shadow-sm transition-all duration-300 pointer-events-auto">
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-gray-400 font-medium dark:text-slate-500">
            <a href="#projects" className="relative nav-link text-brand flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />Projects</a>
            <a href="#about" className="relative nav-link hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5"><User className="w-3.5 h-3.5" />About</a>
            <a href="#experience" className="relative nav-link hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />Experience</a>
            <a href="#stack" className="relative nav-link hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5"><Code className="w-3.5 h-3.5" />Stack</a>
            <a href="#stats" className="relative nav-link hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Stats</a>
            <a href="/blog" className="relative nav-link hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5"><span className="text-sm">📝</span>Blog</a>
        </div>

        <div className="flex md:hidden items-center justify-between w-full">
            <span className="mono text-xs font-bold text-slate-800 dark:text-gray-200">IHS</span>
            <div className="flex items-center gap-2">
                <button 
                  onClick={toggleTheme} 
                  aria-label="Toggle theme"
                  className="w-9 h-9 rounded-full border border-line flex items-center justify-center bg-card shadow-sm cursor-pointer"
                >
                    {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                </button>
                <button 
                  onClick={() => setMenuOpen(!menuOpen)} 
                  aria-label="Toggle menu"
                  className="text-slate-600 dark:text-gray-300 hover:text-brand transition-colors cursor-pointer p-2 rounded-lg border border-line bg-card"
                >
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
        </div>

        <div className="hidden md:flex items-center gap-4 relative z-50">
            <button 
              onClick={toggleTheme} 
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full border border-line flex items-center justify-center hover:border-brand/50 transition-all bg-card shadow-sm z-[200] cursor-pointer pointer-events-auto"
            >
                {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </button>
            <a 
              href="https://buymeacoffee.com/ibrahimhalilsezgin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-widest text-brand font-medium hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
                <Coffee className="w-3.5 h-3.5" /> Support
            </a>
        </div>
        
        {/* Mobile menu */}
        <div className={`mobile-menu w-full md:hidden ${menuOpen ? 'max-h-[320px] opacity-100 mt-3 pt-3 border-t border-line' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300`}>
            <div className="flex flex-col gap-3 text-xs uppercase tracking-widest font-medium">
                <a href="#projects" className="nav-link text-brand flex items-center gap-2 py-1" onClick={() => setMenuOpen(false)}><Layers className="w-4 h-4" />Projects</a>
                <a href="#about" className="nav-link text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 py-1" onClick={() => setMenuOpen(false)}><User className="w-4 h-4" />About</a>
                <a href="#experience" className="nav-link text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 py-1" onClick={() => setMenuOpen(false)}><Briefcase className="w-4 h-4" />Experience</a>
                <a href="#stack" className="nav-link text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 py-1" onClick={() => setMenuOpen(false)}><Code className="w-4 h-4" />Stack</a>
                <a href="#stats" className="nav-link text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 py-1" onClick={() => setMenuOpen(false)}><TrendingUp className="w-4 h-4" />Stats</a>
                <a href="/blog" className="nav-link text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 py-1" onClick={() => setMenuOpen(false)}><span className="text-sm">📝</span>Blog</a>
                <a 
                  href="https://buymeacoffee.com/ibrahimhalilsezgin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand flex items-center gap-2 py-1"
                >
                    <Coffee className="w-4 h-4" /> Support on Buy Me a Coffee
                </a>
            </div>
        </div>
    </nav>

    {/* Header Info Bar */}
    <header className="pt-24 md:pt-28 pb-8 md:pb-12 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-b border-line gap-2 md:gap-4">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500 font-medium dark:text-slate-400">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulseDot"></span>
            <span>{profile.title}</span>
        </div>
        <div className="text-left md:text-right text-slate-600 dark:text-slate-400">
            <p className="text-xs sm:text-sm font-bold tracking-tight">{profile.location}</p>
        </div>
    </header>

    {/* Hero Section */}
    <section className="relative z-10 min-h-[75vh] md:min-h-[80vh] flex flex-col justify-center px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden py-12">
        <div className="hero-glow -z-10" style={{ right: '-10%', top: '10%' }}></div>
        <div className="hero-glow -z-10" style={{ left: '-5%', bottom: '20%', animationDelay: '-4s' }}></div>

        <div className="mb-4 reveal">
            <NativeTypingHeader 
              lines={[
                'Hi 👋, welcome to my profile!',
                `I am a ${profile.title}`,
                'Building modern web and SaaS apps'
              ]}
            />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-6 sm:mb-8 reveal gradient-text text-slate-800 break-words md:whitespace-nowrap py-1 sm:py-2">
            İbrahim Halil Sezgin
        </h1>

        <div className="flex flex-wrap gap-3 sm:gap-4 reveal mt-4 sm:mt-8">
            <a 
              href={profile.linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="px-5 sm:px-6 py-2.5 sm:py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] text-slate-700 dark:text-slate-200 bg-surface shadow-sm transition-all flex items-center gap-2 backdrop-blur-sm"
            >
                <LinkedinIcon className="w-4 h-4" /> LinkedIn
            </a>
            <a 
              href={profile.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="px-5 sm:px-6 py-2.5 sm:py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white hover:border-slate-800 text-slate-700 dark:text-slate-200 bg-surface shadow-sm transition-all flex items-center gap-2 backdrop-blur-sm"
            >
                <GithubIcon className="w-4 h-4" /> GitHub
            </a>
            <a 
              href={`mailto:${profile.email}`} 
              aria-label="Send Email"
              className="px-5 sm:px-6 py-2.5 sm:py-3 border border-brand rounded-full text-xs uppercase tracking-widest hover:bg-brand/90 hover:text-white bg-brand text-white shadow-sm transition-all flex items-center gap-2 backdrop-blur-sm"
            >
                <Mail className="w-4 h-4" /> Email
            </a>
        </div>
    </section>

    {/* About Section */}
    <section id="about" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-16 sm:mb-24 reveal">
            <div className="col-span-12 md:col-span-3 mb-2 md:mb-0">
                <p className="mono text-xs text-slate-500 font-medium">ABOUT ME</p>
            </div>
            <div className="col-span-12 md:col-span-9">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-6 gradient-text py-1">
                    <ScrollReveal enableBlur={true} baseOpacity={0} baseRotation={5} blurStrength={10} delay={0.1}>
                        {profile.about.split('\n')[0]}
                    </ScrollReveal>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-slate-600 dark:text-gray-400 text-base sm:text-lg">
                    {profile.about.split('\n').slice(1).map((p: string, i: number) => (
                        <div key={i}>
                            <ScrollReveal enableBlur={false} baseRotation={0} delay={0.2 + (i * 0.1)}>
                                {p}
                            </ScrollReveal>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>

    {/* Experience Timeline */}
    <section id="experience" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8 sm:mb-12 reveal">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-slate-800 dark:text-gray-200">Experience</h2>
            <p className="mono text-xs text-slate-500 font-medium">CAREER PATH</p>
        </div>
        <div className="relative reveal">
            <div className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px bg-line md:-translate-x-px"></div>
            {experiences.map((exp, idx) => {
                const isRight = idx % 2 === 0;
                return (
                    <div key={exp._id} className="relative flex flex-col md:flex-row mb-8 sm:mb-12 group">
                        <div className={`hidden md:block md:w-1/2 md:pr-12 md:text-right ${!isRight ? 'invisible' : ''}`}>
                            {isRight && (
                                <div className="p-6 bg-surface border border-line rounded-2xl card-lift inline-block text-left md:text-right shadow-sm">
                                    <span className="mono text-[10px] text-brand font-bold uppercase tracking-widest">{exp.year}</span>
                                    <h3 className="text-xl font-bold mt-2 text-slate-800 dark:text-gray-200">{exp.role}</h3>
                                    <p className="text-brand text-sm font-medium">{exp.company}</p>
                                    <p className="text-slate-600 dark:text-gray-400 text-sm mt-3">{exp.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="absolute left-3 md:left-1/2 w-3 h-3 bg-brand rounded-full border-4 border-ink -translate-x-1/2 mt-8 z-10 group-hover:scale-150 transition-transform"></div>
                        <div className="md:w-1/2 md:pl-12 pl-8 sm:pl-12">
                            <div className={`p-5 sm:p-6 bg-surface border border-line rounded-2xl card-lift ${isRight ? 'md:hidden' : ''} shadow-sm`}>
                                <span className="mono text-[10px] text-brand font-bold uppercase tracking-widest">{exp.year}</span>
                                <h3 className="text-lg sm:text-xl font-bold mt-1.5 sm:mt-2 text-slate-800 dark:text-gray-200">{exp.role}</h3>
                                <p className="text-brand text-xs sm:text-sm font-medium">{exp.company}</p>
                                <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mt-2 sm:mt-3">{exp.description}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </section>

    {/* Tech Stack - Orbit */}
    <section id="stack" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto overflow-hidden flex flex-col items-center">
        <div className="px-4 sm:px-6 mb-8 sm:mb-12 reveal text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-slate-800 dark:text-gray-200">Tech Stack</h2>
            <p className="mono text-xs text-slate-500 font-medium mt-2">TECHNOLOGIES I WORK WITH</p>
        </div>
        <div className="reveal w-full max-w-4xl flex items-center justify-center py-6 sm:py-10 relative h-[450px] sm:h-[600px]">
            <OrbitImages
              className="absolute inset-0"
              shape="ellipse"
              showPath={true}
              pathColor="rgba(6, 182, 212, 0.15)"
              radiusX={350}
              radiusY={160}
              duration={40}
              itemSize={50}
              baseWidth={900}
              responsive={true}
              rotation={-10}
              images={[
                "/assets/tech/Unofficial_JavaScript_logo_2.svg",
                "/assets/tech/Typescript_logo_2020.svg",
                "/assets/tech/Svelte_Logo.svg",
                "/assets/tech/Tailwind_CSS_Logo.svg",
                "/assets/tech/Bootstrap_logo.svg",
                "/assets/tech/Node.js_logo.svg",
                "/assets/tech/Expressjs.png",
                "/assets/tech/PHP-logo.svg",
                "/assets/tech/Csharp_Logo.png",
                "/assets/tech/.NET_Core_Logo.svg",
                "/assets/tech/Python-logo-notext.svg",
                "/assets/tech/MongoDB_Logo.svg",
                "/assets/tech/Database-mysql.svg",
                "/assets/tech/Docker_%28container_engine%29_logo.svg",
                "/assets/tech/Cloudflare_Logo.svg",
                "/assets/tech/Nginx_logo.svg",
                "/assets/tech/Git-logo.svg",
                "/assets/tech/Octicons-mark-github.svg"
              ]}
              centerContent={
                <div className="relative">
                  <div className="absolute inset-0 bg-brand/10 blur-2xl rounded-full scale-150"></div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface text-slate-800 dark:text-gray-100 rounded-full flex items-center justify-center shadow-lg border border-line z-10 font-bold text-lg sm:text-2xl relative">
                      Techs
                  </div>
                </div>
              }
            />
        </div>
    </section>

    {/* Featured Projects with ScrollStack */}
    <section id="projects" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto overflow-visible">
        <div className="px-4 sm:px-6 mb-6 sm:mb-8 reveal">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-4 text-slate-800 dark:text-gray-200">Key Projects & Experience</h2>
            <div className="flex flex-wrap gap-2">
                {['all', 'saas', 'web', 'api'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs uppercase tracking-widest border transition-all font-medium cursor-pointer ${filter === f ? 'bg-brand text-white border-brand shadow-sm' : 'border-line text-slate-500 hover:border-brand/30 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >{f}</button>
                ))}
            </div>
        </div>
        
        <div className="reveal w-full">
            <ScrollStack
                itemDistance={60}
                itemScale={0.03}
                itemStackDistance={20}
                stackPosition="15%"
                scaleEndPosition="5%"
                baseScale={0.88}
                rotationAmount={1}
                blurAmount={0}
                useWindowScroll={true}
            >
                {filteredProjects.map((proj) => (
                    <ScrollStackItem key={proj._id}>
                        <article className="group relative bg-surface border border-line rounded-2xl sm:rounded-3xl overflow-hidden hover:border-brand/30 hover:shadow-xl transition-all flex flex-col md:flex-row h-full">
                            <div className="w-full md:w-1/2 aspect-video md:aspect-auto overflow-hidden bg-slate-100 dark:bg-black/20">
                                <img 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                  src={proj.imageUrl} 
                                  alt={proj.title}
                                  width={600}
                                  height={400}
                                  loading="lazy"
                                  decoding="async"
                                />
                            </div>
                            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-3 sm:mb-4">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-gray-200">{proj.title}</h3>
                                    {proj.featuredText && (
                                        <span className="px-3 py-1 bg-brand/10 text-brand font-bold text-[10px] uppercase tracking-widest rounded-full border border-brand/20">{proj.featuredText}</span>
                                    )}
                                </div>
                                <p className="text-slate-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-lg">{proj.description}</p>
                                <a 
                                  href={proj.projectUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex w-max items-center gap-2 text-xs sm:text-sm text-brand font-bold hover:text-white transition-colors bg-brand/10 hover:bg-brand px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-brand/20 hover:border-brand"
                                >
                                    Explore Platform <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </article>
                    </ScrollStackItem>
                ))}
            </ScrollStack>
        </div>
    </section>

    {/* GitHub Stats */}
    <section id="stats" className="relative z-10 py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-8 reveal text-slate-800 dark:text-gray-200">GitHub Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 reveal-stagger">
            <a 
              href={`https://github.com/${profile.githubUsername}`} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Repositories"
              className="p-6 bg-surface border border-line rounded-2xl sm:rounded-3xl flex flex-col justify-between group hover:border-brand/30 transition-all shadow-sm card-lift"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                        <GithubIcon className="w-5 h-5" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-1">{ghStats.public_repos || 0}</h3>
                    <p className="text-sm text-slate-500 font-medium">Public Repositories</p>
                </div>
            </a>
            
            <div className="p-6 bg-surface border border-line rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-sm card-lift">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-1">{ghStats.followers || 0}</h3>
                    <p className="text-sm text-slate-500 font-medium">Followers</p>
                </div>
            </div>

            <div className="p-6 bg-surface border border-line rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-sm card-lift">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                        <GitBranch className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-1">{ghStats.public_gists || 0}</h3>
                    <p className="text-sm text-slate-500 font-medium">Public Gists</p>
                </div>
            </div>
            
            <a 
              href={`https://github.com/${profile.githubUsername}?tab=repositories`} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Explore Code on GitHub"
              className="p-6 bg-brand text-white rounded-2xl sm:rounded-3xl flex flex-col justify-between group hover:brightness-110 transition-all shadow-md card-lift relative overflow-hidden"
            >
                <div className="absolute -right-4 -bottom-4 opacity-20">
                    <GithubIcon className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">Explore Code</h3>
                    <p className="text-sm text-white/90 font-medium flex items-center gap-2">View Repositories <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></p>
                </div>
            </a>
        </div>
    </section>

    {/* Comments Section */}
    <section id="comments" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            
            {/* Comment Submission Form */}
            <div className="reveal order-2 lg:order-1 bg-surface border border-line rounded-3xl p-6 sm:p-10 shadow-sm card-lift relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-blue-500 to-purple-500"></div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-gray-200 mb-2">Leave a Note</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-8">What was it like working together? Drop a message!</p>
                
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Name</label>
                            <input 
                                required 
                                type="text" 
                                value={commentForm.name}
                                onChange={e => setCommentForm({...commentForm, name: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" 
                                placeholder="John Doe" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Role / Company (Optional)</label>
                            <input 
                                type="text" 
                                value={commentForm.role}
                                onChange={e => setCommentForm({...commentForm, role: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40" 
                                placeholder="CEO at TechCorp" 
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Message</label>
                        <textarea 
                            required 
                            rows={4} 
                            value={commentForm.content}
                            onChange={e => setCommentForm({...commentForm, content: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none" 
                            placeholder="Your work on the project was phenomenal..." 
                        ></textarea>
                    </div>
                    
                    {commentStatus.message && (
                        <p className="text-sm text-emerald-600 bg-emerald-500/10 p-3 rounded-lg font-medium border border-emerald-500/20">{commentStatus.message}</p>
                    )}
                    {commentStatus.error && (
                        <p className="text-sm text-red-600 bg-red-500/10 p-3 rounded-lg font-medium border border-red-500/20">{commentStatus.error}</p>
                    )}

                    <button 
                        type="submit" 
                        disabled={commentStatus.loading}
                        className="w-full sm:w-auto px-8 py-3.5 bg-brand text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {commentStatus.loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>

            {/* Comments Slider */}
            <div className="reveal order-1 lg:order-2">
                <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-slate-800 dark:text-gray-200">Word on the Street</h2>
                    <p className="mono text-xs text-slate-500 font-medium mt-2">WHAT PEOPLE SAY</p>
                </div>

                {comments && comments.length > 0 ? (
                    <div className="relative">
                        <div className="bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-3xl p-8 sm:p-12 relative">
                            <span className="absolute top-6 left-6 text-6xl text-brand/20 font-serif leading-none">"</span>
                            
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentCommentIdx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="relative z-10"
                                >
                                    <p className="text-lg sm:text-xl text-slate-700 dark:text-gray-300 italic mb-8 font-medium leading-relaxed">
                                        {comments[currentCommentIdx].content}
                                    </p>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-gray-200 text-lg">{comments[currentCommentIdx].name}</h4>
                                        {comments[currentCommentIdx].role && (
                                            <p className="text-sm text-brand font-medium mt-1">{comments[currentCommentIdx].role}</p>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        {comments.length > 1 && (
                            <div className="flex gap-2 mt-6 justify-end">
                                <button 
                                    onClick={prevComment}
                                    className="w-12 h-12 rounded-full border border-line bg-surface flex items-center justify-center hover:border-brand/50 hover:text-brand transition-colors text-slate-500"
                                >
                                    <ArrowRight className="w-5 h-5 rotate-180" />
                                </button>
                                <button 
                                    onClick={nextComment}
                                    className="w-12 h-12 rounded-full border border-line bg-surface flex items-center justify-center hover:border-brand/50 hover:text-brand transition-colors text-slate-500"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center py-16 text-center bg-slate-50 dark:bg-ink/30 rounded-3xl border border-dashed border-slate-300 dark:border-line/50">
                        <div className="text-4xl mb-4">💬</div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-gray-300">No Comments Yet</h3>
                        <p className="text-sm text-slate-500">Be the first to leave a note!</p>
                    </div>
                )}
            </div>
        </div>
    </section>

    {/* Footer */}
    <footer className="relative z-10 border-t border-line mt-16 sm:mt-24 px-4 sm:px-6 py-12 sm:py-16 max-w-7xl mx-auto text-center md:text-left reveal">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="md:col-span-6 flex flex-col items-center md:items-start">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-4 text-slate-800 dark:text-gray-200 gradient-text py-1">İbrahim Halil Sezgin</h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 max-w-md mb-6 sm:mb-8">{profile.bio}</p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-line text-xs font-medium text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} İbrahim Halil Sezgin. Crafted with passion.</p>
            <p className="flex items-center gap-2">{profile.location} <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {time}</p>
        </div>
    </footer>
    </div>
    </>
  );
}
