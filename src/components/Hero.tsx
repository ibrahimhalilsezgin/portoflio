import Image from 'next/image';

export default function Hero({ profile }: { profile: any }) {
  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="absolute inset-0 -z-10 dot-grid opacity-50"></div>
      
      <div className="hero-glow -z-10" style={{ right: '-10%', top: '10%' }}></div>
      <div className="hero-glow -z-10" style={{ left: '-5%', bottom: '20%', animationDelay: '-4s' }}></div>

      <div className="mb-4">
        {/* Replace with a Next/Image or keep img for typing svg */}
        <img src={`https://readme-typing-svg.herokuapp.com?color=%2336BCF7&center=false&vCenter=true&width=500&lines=Hi+,+welcome+to+my+profile!;I+am+${profile?.title || 'a Developer'};Building+modern+web+and+SaaS+apps;`} alt="Typing SVG" />
      </div>

      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8 gradient-text">
        {profile?.name ? profile.name.split(' ').map((n: string, i: number) => <span key={i}>{n}<br/></span>) : 'Ibrahim Halil Sezgin'}
      </h1>

      <div className="flex flex-wrap gap-4">
        <a href={profile?.linkedinUrl} target="_blank" className="px-6 py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-all flex items-center gap-2 backdrop-blur-sm">
           LinkedIn
        </a>
        <a href={profile?.githubUrl} target="_blank" className="px-6 py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-ink hover:border-white transition-all flex items-center gap-2 backdrop-blur-sm">
           GitHub
        </a>
        <a href={`mailto:${profile?.email}`} className="px-6 py-3 border border-line rounded-full text-xs uppercase tracking-widest hover:bg-brand hover:text-ink hover:border-brand transition-all flex items-center gap-2 backdrop-blur-sm">
           Email
        </a>
      </div>

      <div className="mt-12 relative aspect-video max-h-[500px] rounded-2xl overflow-hidden border border-line shadow-2xl group">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_0490948cf7_045463247b61ea9e.png" alt="Workspace" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60"></div>
      </div>
    </section>
  );
}
