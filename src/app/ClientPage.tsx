'use client';
import { useEffect, useState } from 'react';
import SplashCursor from '@/components/SplashCursor';
import OrbitImages from '@/components/OrbitImages';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack';

export default function ClientPage({ profile, experiences, projects }: { profile: any, experiences: any[], projects: any[] }) {
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [ghStats, setGhStats] = useState<any>({});
  
  const [theme, setTheme] = useState('light');
  const [time, setTime] = useState('');
  
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
    // Default to light unless explicitly set to dark
    const isDark = storedTheme === 'dark';
    
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      setTheme('light');
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
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => observer.observe(el));

    // Fetch GH
    fetch(`https://api.github.com/users/${profile.githubUsername}`)
      .then(r => r.json())
      .then(d => setGhStats(d))
      .catch(() => {});

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

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.categories?.includes(filter));

  return (
    <>
    {/* SplashCursor Wrapper */}
    <div className="fixed inset-0 z-0 pointer-events-none">
      <SplashCursor />
    </div>

    {/* Content Wrapper */}
    <div className="relative z-10 pointer-events-auto">

    {/* Preloader */}
    <div id="preloader" className="fixed inset-0 z-[100] bg-ink flex items-center justify-center transition-opacity duration-500 opacity-0 pointer-events-none">
        <div className="text-center">
            <div className="w-12 h-12 border-2 border-line border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
            <p className="mono text-xs text-slate-500 tracking-widest">LOADING</p>
        </div>
    </div>

    {/* Cursor Glow */}
    <div className="cursor-glow hidden md:block opacity-30 mix-blend-multiply" id="cursorGlow"></div>

    {/* Navigation */}
    <nav id="mainNav" className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-7xl bg-surface/80 backdrop-blur-md border border-line rounded-2xl md:rounded-full px-6 py-3 flex flex-wrap justify-between items-center shadow-md transition-all duration-300 pointer-events-auto">
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-gray-400 font-medium dark:text-slate-600">
            <a href="#projects" className="relative nav-link text-brand"><i className="fa-solid fa-layer-group mr-2"></i>Projects</a>
            <a href="#about" className="relative nav-link hover:text-white dark:hover:text-slate-900 transition-colors"><i className="fa-regular fa-user mr-2"></i>About</a>
            <a href="#experience" className="relative nav-link hover:text-white dark:hover:text-slate-900 transition-colors"><i className="fa-solid fa-briefcase mr-2"></i>Experience</a>
            <a href="#stack" className="relative nav-link hover:text-white dark:hover:text-slate-900 transition-colors"><i className="fa-solid fa-code mr-2"></i>Stack</a>
            <a href="#stats" className="relative nav-link hover:text-white dark:hover:text-slate-900 transition-colors"><i className="fa-solid fa-chart-line mr-2"></i>Stats</a>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-brand transition-colors cursor-pointer relative z-50 p-2">
            <i className="fa-solid fa-bars text-lg"></i>
        </button>
        <div className="hidden md:flex items-center gap-4 relative z-50">
            <button onClick={(e) => { e.preventDefault(); toggleTheme(); }} className="w-10 h-10 rounded-full border border-line flex items-center justify-center hover:border-brand/50 transition-all bg-card shadow-sm z-[200] cursor-pointer pointer-events-auto">
                {theme === 'light' ? <i className="fa-solid fa-moon text-lg text-slate-700"></i> : <i className="fa-solid fa-sun text-lg text-yellow-400"></i>}
            </button>
            <a href="https://buymeacoffee.com/ibrahimhalilsezgin" target="_blank" className="text-xs uppercase tracking-widest text-brand font-medium hover:text-white dark:hover:text-slate-900 transition-colors"><i className="fa-solid fa-mug-hot mr-1"></i> Support</a>
            <a href="/admin" className="text-xs uppercase tracking-widest text-gray-500 hover:text-white dark:hover:text-slate-900 transition-colors"><i className="fa-solid fa-lock mr-1"></i> Admin</a>
        </div>
        
        {/* Mobile menu */}
        <div className={`mobile-menu w-full md:hidden ${menuOpen ? 'max-h-[300px]' : 'max-h-0'} overflow-hidden transition-all duration-300`}>
            <div className="flex flex-col gap-4 py-4 text-xs uppercase tracking-widest font-medium">
                <a href="#projects" className="nav-link text-brand" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-layer-group mr-2"></i>Projects</a>
                <a href="#about" className="nav-link text-gray-400 hover:text-white dark:hover:text-slate-900" onClick={() => setMenuOpen(false)}><i className="fa-regular fa-user mr-2"></i>About</a>
                <a href="#experience" className="nav-link text-gray-400 hover:text-white dark:hover:text-slate-900" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-briefcase mr-2"></i>Experience</a>
                <a href="#stack" className="nav-link text-gray-400 hover:text-white dark:hover:text-slate-900" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-code mr-2"></i>Stack</a>
                <a href="#stats" className="nav-link text-gray-400 hover:text-white dark:hover:text-slate-900" onClick={() => setMenuOpen(false)}><i className="fa-solid fa-chart-line mr-2"></i>Stats</a>
                <a href="/admin" className="text-gray-500 hover:text-white"><i className="fa-solid fa-lock mr-2"></i>Admin</a>
                
                <div className="pt-2 mt-2 border-t border-line flex justify-between items-center relative z-50">
                    <span className="text-gray-500">Theme</span>
                    <button onClick={(e) => { e.preventDefault(); toggleTheme(); }} className="w-10 h-10 rounded-full border border-line flex items-center justify-center bg-card shadow-sm cursor-pointer pointer-events-auto">
                        {theme === 'light' ? <i className="fa-solid fa-moon text-sm text-slate-700"></i> : <i className="fa-solid fa-sun text-sm text-yellow-400"></i>}
                    </button>
                </div>
            </div>
        </div>
    </nav>

    {/* Header Info Bar */}
    <header className="pt-28 pb-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end border-b border-line gap-4">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gray-400 font-medium dark:text-slate-500">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulseDot"></span>
            <span id="role-ticker">{profile.title}</span>
        </div>
        <div className="text-left md:text-right text-gray-200 dark:text-slate-700">
            <p className="text-sm font-bold tracking-tight">{profile.location}</p>
        </div>
    </header>

    {/* Hero Section */}
    <section className="relative z-10 min-h-[80vh] flex flex-col justify-center px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute inset-0 -z-10 dot-grid opacity-50"></div>
        <div className="absolute right-0 top-1/4 w-1/2 h-full bg-gradient-to-l from-card/20 to-transparent -z-10"></div>
        <div className="hero-glow -z-10" style={{ right: '-10%', top: '10%' }}></div>
        <div className="hero-glow -z-10" style={{ left: '-5%', bottom: '20%', animationDelay: '-4s' }}></div>

        <div className="mb-4 reveal">
            <img src={`https://readme-typing-svg.herokuapp.com?color=%2336BCF7&center=false&vCenter=true&width=500&lines=Hi+,+welcome+to+my+profile!;I+am+a+${profile.title.replace(' ', '+')};Building+modern+web+and+SaaS+apps;`} alt="Typing SVG" />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8 reveal gradient-text text-slate-800 whitespace-nowrap">
            {profile.name}
        </h1>

        <div className="flex flex-wrap gap-4 reveal mt-8">
            <a href={profile.linkedinUrl} target="_blank" className="px-6 py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] text-slate-700 bg-white shadow-sm transition-all flex items-center gap-2 backdrop-blur-sm">
                <i className="fa-brands fa-linkedin"></i> LinkedIn
            </a>
            <a href={profile.githubUrl} target="_blank" className="px-6 py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-slate-800 hover:text-white hover:border-slate-800 text-slate-700 bg-white shadow-sm transition-all flex items-center gap-2 backdrop-blur-sm">
                <i className="fa-brands fa-github"></i> GitHub
            </a>
            <a href={`mailto:${profile.email}`} className="px-6 py-3 border border-brand rounded-full text-xs uppercase tracking-widest hover:bg-brand/90 hover:text-white bg-brand text-white shadow-sm transition-all flex items-center gap-2 backdrop-blur-sm">
                <i className="fa-solid fa-envelope"></i> Email
            </a>
        </div>
    </section>

    {/* About Section */}
    <section id="about" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 mb-24 reveal">
            <div className="col-span-12 md:col-span-3">
                <p className="mono text-xs text-slate-500 font-medium">ABOUT ME</p>
            </div>
            <div className="col-span-12 md:col-span-9">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-6 gradient-text">
                    {profile.about.split('\n')[0]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600 dark:text-gray-400 text-lg">
                    {profile.about.split('\n').slice(1).map((p: string, i: number) => <p key={i}>{p}</p>)}
                </div>
            </div>
        </div>
    </section>

    {/* Experience Timeline */}
    <section id="experience" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 reveal">
            <h2 className="text-4xl font-bold tracking-tighter text-slate-800 dark:text-gray-200">Experience</h2>
            <p className="mono text-xs text-slate-500 font-medium">CAREER PATH</p>
        </div>
        <div className="relative reveal">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-line md:-translate-x-px"></div>
            {experiences.map((exp, idx) => {
                const isRight = idx % 2 === 0;
                return (
                    <div key={exp._id} className="relative flex flex-col md:flex-row mb-12 group">
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
                        <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-brand rounded-full border-4 border-ink -translate-x-1/2 mt-8 z-10 group-hover:scale-150 transition-transform"></div>
                        <div className="md:w-1/2 md:pl-12 pl-12">
                            {(!isRight || true) && (
                                <div className={`p-6 bg-surface border border-line rounded-2xl card-lift ${isRight ? 'md:hidden' : ''} shadow-sm`}>
                                    <span className="mono text-[10px] text-brand font-bold uppercase tracking-widest">{exp.year}</span>
                                    <h3 className="text-xl font-bold mt-2 text-slate-800 dark:text-gray-200">{exp.role}</h3>
                                    <p className="text-brand text-sm font-medium">{exp.company}</p>
                                    <p className="text-slate-600 dark:text-gray-400 text-sm mt-3">{exp.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </section>

    {/* Tech Stack - Orbit */}
    <section id="stack" className="relative z-10 py-24 max-w-7xl mx-auto overflow-hidden flex flex-col items-center">
        <div className="px-6 mb-12 reveal text-center">
            <h2 className="text-4xl font-bold tracking-tighter text-slate-800 dark:text-gray-200">Tech Stack</h2>
            <p className="mono text-xs text-slate-500 font-medium mt-2">TECHNOLOGIES I WORK WITH</p>
        </div>
        <div className="reveal w-full max-w-4xl flex items-center justify-center py-10 relative h-[600px]">
            <OrbitImages
              className="absolute inset-0"
              shape="ellipse"
              showPath={true}
              pathColor="rgba(6, 182, 212, 0.15)"
              radiusX={400}
              radiusY={180}
              duration={40}
              itemSize={60}
              baseWidth={1000}
              responsive={true}
              rotation={-10}
              images={[
                "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg",
                "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg",
                "https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/b/b2/Bootstrap_logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png",
                "https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png",
                "https://upload.wikimedia.org/wikipedia/commons/e/ee/.NET_Core_Logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
                "https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/b/b2/Database-mysql.svg",
                "https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/c/c5/Nginx_logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/e/e0/Git-logo.svg",
                "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
              ]}
              centerContent={
                <div className="relative">
                  <div className="absolute inset-0 bg-brand/10 blur-2xl rounded-full scale-150"></div>
                  <div className="w-20 h-20 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-lg border border-line z-10 font-bold text-2xl relative">
                      Techs
                  </div>
                </div>
              }
            />
        </div>
    </section>

    {/* Featured Projects with ScrollStack */}
    <section id="projects" className="relative z-10 py-24 max-w-7xl mx-auto overflow-visible">
        <div className="px-6 mb-8 reveal">
            <h2 className="text-4xl font-bold tracking-tighter mb-4 text-slate-800 dark:text-gray-200">Key Projects & Experience</h2>
            <div className="flex flex-wrap gap-2">
                {['all', 'saas', 'web', 'api'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-all font-medium ${filter === f ? 'bg-brand text-white border-brand shadow-sm' : 'border-line text-slate-500 hover:border-brand/30 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >{f}</button>
                ))}
            </div>
        </div>
        
        <div className="reveal w-full">
            <ScrollStack
                itemDistance={80}
                itemScale={0.03}
                itemStackDistance={30}
                stackPosition="15%"
                scaleEndPosition="5%"
                baseScale={0.85}
                rotationAmount={2}
                blurAmount={1}
                useWindowScroll={true}
            >
                {filteredProjects.map((proj, i) => (
                    <ScrollStackItem key={proj._id}>
                        <article className="group relative bg-surface border border-line rounded-3xl overflow-hidden hover:border-brand/30 hover:shadow-xl transition-all flex flex-col md:flex-row h-full">
                            <div className="w-full md:w-1/2 aspect-video md:aspect-auto overflow-hidden bg-slate-100 dark:bg-black/20">
                                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={proj.imageUrl} alt={proj.title} />
                            </div>
                            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-200">{proj.title}</h3>
                                    {proj.featuredText && (
                                        <span className="px-3 py-1 bg-brand/10 text-brand font-bold text-[10px] uppercase tracking-widest rounded-full border border-brand/20">{proj.featuredText}</span>
                                    )}
                                </div>
                                <p className="text-slate-600 dark:text-gray-400 mb-8 text-lg">{proj.description}</p>
                                <a href={proj.projectUrl} target="_blank" className="inline-flex w-max items-center gap-2 text-sm text-brand font-bold hover:text-white transition-colors bg-brand/10 hover:bg-brand px-6 py-3 rounded-full border border-brand/20 hover:border-brand">
                                    Explore Platform <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                                </a>
                            </div>
                        </article>
                    </ScrollStackItem>
                ))}
            </ScrollStack>
        </div>
    </section>

    {/* GitHub Stats */}
    <section id="stats" className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter mb-8 reveal text-slate-800 dark:text-gray-200">GitHub Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 reveal-stagger">
            <a href={`https://github.com/${profile.githubUsername}`} target="_blank" className="p-6 bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-3xl flex flex-col justify-between group hover:border-brand/30 transition-all shadow-sm card-lift">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                        <i className="fa-brands fa-github text-xl"></i>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-1">{ghStats.public_repos || 0}</h3>
                    <p className="text-sm text-slate-500 font-medium">Public Repositories</p>
                </div>
            </a>
            
            <div className="p-6 bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-3xl flex flex-col justify-between shadow-sm card-lift">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                        <i className="fa-solid fa-users text-xl"></i>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-1">{ghStats.followers || 0}</h3>
                    <p className="text-sm text-slate-500 font-medium">Followers</p>
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-3xl flex flex-col justify-between shadow-sm card-lift">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                        <i className="fa-solid fa-code-branch text-xl"></i>
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-200 mb-1">{ghStats.public_gists || 0}</h3>
                    <p className="text-sm text-slate-500 font-medium">Public Gists</p>
                </div>
            </div>
            
            <a href={`https://github.com/${profile.githubUsername}?tab=repositories`} target="_blank" className="p-6 bg-brand text-white rounded-3xl flex flex-col justify-between group hover:brightness-110 transition-all shadow-md card-lift relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-20">
                    <i className="fa-brands fa-github text-9xl"></i>
                </div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-star text-xl"></i>
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">Explore Code</h3>
                    <p className="text-sm text-white/80 font-medium flex items-center gap-2">View Repositories <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i></p>
                </div>
            </a>
        </div>
    </section>

    {/* Footer */}
    <footer className="relative z-10 border-t border-line mt-24 px-6 py-16 max-w-7xl mx-auto text-center md:text-left reveal">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-6 flex flex-col items-center md:items-start">
                <h2 className="text-4xl font-bold tracking-tighter mb-4 text-slate-800 dark:text-gray-200 gradient-text">{profile.name}</h2>
                <p className="text-lg text-slate-600 dark:text-gray-400 max-w-md mb-8">{profile.bio}</p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-line text-xs font-medium text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} {profile.name}. Crafted with passion.</p>
            <p className="flex items-center gap-2">{profile.location} <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {time}</p>
        </div>
    </footer>
    </div>
    </>
  );
}
