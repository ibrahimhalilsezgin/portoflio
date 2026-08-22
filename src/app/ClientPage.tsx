'use client';
import { useEffect, useState } from 'react';

export default function ClientPage({ profile, experiences, projects }: { profile: any, experiences: any[], projects: any[] }) {
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [ghStats, setGhStats] = useState<any>({});
  
  const [theme, setTheme] = useState('dark');
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
    const isLight = localStorage.getItem('theme') === 'light' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (isLight) {
      document.documentElement.classList.add('light-mode');
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
    html.classList.toggle('light-mode');
    const isLight = html.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    setTheme(isLight ? 'light' : 'dark');
  };

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.categories?.includes(filter));

  return (
    <>
    {/* Preloader */}
    <div id="preloader" className="fixed inset-0 z-[100] bg-ink flex items-center justify-center transition-opacity duration-500 opacity-0 pointer-events-none">
        <div className="text-center">
            <div className="w-12 h-12 border-2 border-line border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
            <p className="mono text-xs text-gray-500 tracking-widest">LOADING</p>
        </div>
    </div>

    {/* Cursor Glow */}
    <div className="cursor-glow hidden md:block" id="cursorGlow"></div>

    {/* Navigation */}
    <nav id="mainNav" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl bg-surface/80 backdrop-blur-md border border-line rounded-2xl md:rounded-full px-6 py-3 flex flex-wrap justify-between items-center shadow-2xl transition-all duration-300">
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest">
            <a href="#projects" className="relative nav-link text-brand"><span className="mr-1">●</span>Projects</a>
            <a href="#about" className="relative nav-link">About</a>
            <a href="#experience" className="relative nav-link">Experience</a>
            <a href="#stack" className="relative nav-link">Stack</a>
            <a href="#stats" className="relative nav-link">Stats</a>
            <a href="#certs" className="relative nav-link">Certs</a>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-300 hover:text-brand transition-colors">
            <i className="fa-solid fa-bars text-lg"></i>
        </button>
        <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleTheme} className="w-8 h-8 rounded-full border border-line flex items-center justify-center hover:border-brand/50 transition-all">
                {theme === 'light' ? <i className="fa-solid fa-moon text-sm text-slate-700"></i> : <i className="fa-solid fa-sun text-sm text-yellow-400"></i>}
            </button>
            <a href="https://buymeacoffee.com/ibrahimhalilsezgin" target="_blank" className="text-xs uppercase tracking-widest text-brand hover:text-white transition-colors">Support Me</a>
            <a href="/admin" className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Admin</a>
        </div>
        
        {/* Mobile menu */}
        <div className={`mobile-menu w-full md:hidden ${menuOpen ? 'max-h-[300px]' : 'max-h-0'} overflow-hidden transition-all duration-300`}>
            <div className="flex flex-col gap-4 py-4 text-xs uppercase tracking-widest">
                <a href="#projects" className="nav-link text-brand" onClick={() => setMenuOpen(false)}><span className="mr-1">●</span>Projects</a>
                <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About</a>
                <a href="#experience" className="nav-link" onClick={() => setMenuOpen(false)}>Experience</a>
                <a href="#stack" className="nav-link" onClick={() => setMenuOpen(false)}>Stack</a>
                <a href="#stats" className="nav-link" onClick={() => setMenuOpen(false)}>Stats</a>
                <a href="/admin" className="text-gray-500">Admin</a>
            </div>
        </div>
    </nav>

    {/* Header Info Bar */}
    <header className="pt-28 pb-12 px-6 max-w-7xl mx-auto flex justify-between items-end border-b border-line">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gray-500">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulseDot"></span>
            <span id="role-ticker">{profile.title}</span>
        </div>
        <div className="text-right">
            <p className="text-sm font-bold tracking-tight">{profile.location}</p>
        </div>
    </header>

    {/* Hero Section */}
    <section className="relative min-h-[80vh] flex flex-col justify-center px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute inset-0 -z-10 dot-grid opacity-50"></div>
        <div className="absolute right-0 top-1/4 w-1/2 h-full bg-gradient-to-l from-card/20 to-transparent -z-10"></div>
        <div className="hero-glow -z-10" style={{ right: '-10%', top: '10%' }}></div>
        <div className="hero-glow -z-10" style={{ left: '-5%', bottom: '20%', animationDelay: '-4s' }}></div>

        <div className="mb-4 reveal">
            <img src={`https://readme-typing-svg.herokuapp.com?color=%2336BCF7&center=false&vCenter=true&width=500&lines=Hi+,+welcome+to+my+profile!;I+am+a+${profile.title.replace(' ', '+')};Building+modern+web+and+SaaS+apps;`} alt="Typing SVG" />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8 reveal gradient-text">
            {profile.name.split(' ').map((n: string, i: number) => <span key={i}>{n}<br/></span>)}
        </h1>

        <div className="flex flex-wrap gap-4 reveal">
            <a href={profile.linkedinUrl} target="_blank" className="px-6 py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-all flex items-center gap-2 backdrop-blur-sm">
                <i className="fa-brands fa-linkedin"></i> LinkedIn
            </a>
            <a href={profile.githubUrl} target="_blank" className="px-6 py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-ink hover:border-white transition-all flex items-center gap-2 backdrop-blur-sm">
                <i className="fa-brands fa-github"></i> GitHub
            </a>
            <a href={`mailto:${profile.email}`} className="px-6 py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-brand hover:text-ink hover:border-brand transition-all flex items-center gap-2 backdrop-blur-sm">
                <i className="fa-solid fa-envelope"></i> Email
            </a>
        </div>

        {/* Hero Visual */}
        <div className="mt-12 relative aspect-video max-h-[500px] rounded-2xl overflow-hidden border border-line shadow-2xl reveal group">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_0490948cf7_045463247b61ea9e.png" alt="workspace" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60"></div>
        </div>
    </section>

    {/* About Section */}
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 mb-24 reveal">
            <div className="col-span-12 md:col-span-3">
                <p className="mono text-xs text-gray-500">ABOUT ME</p>
            </div>
            <div className="col-span-12 md:col-span-9">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-6 gradient-text">
                    {profile.about.split('\n')[0]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-400 text-lg">
                    {profile.about.split('\n').slice(1).map((p: string, i: number) => <p key={i}>{p}</p>)}
                </div>
            </div>
        </div>
    </section>

    {/* Experience Timeline */}
    <section id="experience" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 reveal">
            <h2 className="text-4xl font-bold tracking-tighter">Experience</h2>
            <p className="mono text-xs text-gray-500">CAREER PATH</p>
        </div>
        <div className="relative reveal">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-line md:-translate-x-px"></div>
            {experiences.map((exp, idx) => {
                const isRight = idx % 2 === 0;
                return (
                    <div key={exp._id} className="relative flex flex-col md:flex-row mb-12 group">
                        <div className={`hidden md:block md:w-1/2 md:pr-12 md:text-right ${!isRight ? 'invisible' : ''}`}>
                            {isRight && (
                                <div className="p-6 bg-surface/80 backdrop-blur-sm border border-line rounded-2xl card-lift inline-block text-left md:text-right">
                                    <span className="mono text-[10px] text-brand uppercase tracking-widest">{exp.year}</span>
                                    <h3 className="text-xl font-bold mt-2">{exp.role}</h3>
                                    <p className="text-brand text-sm font-medium">{exp.company}</p>
                                    <p className="text-gray-400 text-sm mt-3">{exp.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-brand rounded-full border-4 border-ink -translate-x-1/2 mt-8 z-10 group-hover:scale-150 transition-transform"></div>
                        <div className="md:w-1/2 md:pl-12 pl-12">
                            {(!isRight || true) && (
                                <div className={`p-6 bg-surface/80 backdrop-blur-sm border border-line rounded-2xl card-lift ${isRight ? 'md:hidden' : ''}`}>
                                    <span className="mono text-[10px] text-brand uppercase tracking-widest">{exp.year}</span>
                                    <h3 className="text-xl font-bold mt-2">{exp.role}</h3>
                                    <p className="text-brand text-sm font-medium">{exp.company}</p>
                                    <p className="text-gray-400 text-sm mt-3">{exp.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </section>

    {/* Featured Projects */}
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter mb-8 reveal">Key Projects & Experience</h2>
        <div className="flex flex-wrap gap-2 mb-12 reveal">
            {['all', 'saas', 'web', 'api'].map(f => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-all ${filter === f ? 'bg-brand/10 text-brand border-brand/50' : 'border-line text-gray-400 hover:border-brand/30'}`}
                >{f}</button>
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 reveal-stagger">
            {filteredProjects.map(proj => (
                <article key={proj._id} className="group relative bg-surface/80 backdrop-blur-sm border border-line rounded-3xl overflow-hidden hover:border-brand/50 transition-all card-lift">
                    <div className="aspect-video overflow-hidden">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={proj.imageUrl} alt={proj.title} />
                    </div>
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold">{proj.title}</h3>
                            {proj.featuredText && (
                                <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] uppercase tracking-widest rounded-full border border-brand/20">{proj.featuredText}</span>
                            )}
                        </div>
                        <p className="text-gray-400 mb-6">{proj.description}</p>
                        <a href={proj.projectUrl} target="_blank" className="inline-flex items-center gap-2 text-sm text-white font-bold group-hover:text-brand transition-colors">
                            Explore Platform <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                        </a>
                    </div>
                </article>
            ))}
        </div>
    </section>

    {/* GitHub Stats */}
    <section id="stats" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter mb-12 reveal">GitHub Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 reveal-stagger">
            <div className="p-6 bg-surface/80 backdrop-blur-sm border border-line rounded-3xl flex items-center justify-center card-lift">
                <img src={`https://github-readme-stats.shion.dev/api?username=${profile.githubUsername}&theme=dark&hide_border=true&include_all_commits=true&count_private=true`} alt="Stats" className="w-full" />
            </div>
            <div className="p-6 bg-surface/80 backdrop-blur-sm border border-line rounded-3xl flex items-center justify-center card-lift">
                <img src={`https://github-readme-stats.shion.dev/api/top-langs/?username=${profile.githubUsername}&theme=dark&hide_border=true&include_all_commits=true&count_private=true&layout=compact`} alt="Langs" className="w-full" />
            </div>
        </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-line mt-24 px-6 py-16 max-w-7xl mx-auto text-center md:text-left reveal">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-6 flex flex-col items-center md:items-start">
                <h2 className="text-4xl font-bold tracking-tighter mb-4 text-white gradient-text">{profile.name}</h2>
                <p className="text-lg text-gray-400 max-w-md mb-8">{profile.bio}</p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-line text-xs text-gray-500 gap-4">
            <p>&copy; {new Date().getFullYear()} {profile.name}. Crafted with passion.</p>
            <p className="flex items-center gap-2">{profile.location} <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {time}</p>
        </div>
    </footer>
    </>
  );
}
