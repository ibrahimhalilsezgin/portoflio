'use client';
import { useState } from 'react';

export default function ProjectSection({ projects }: { projects: any[] }) {
  const [filter, setFilter] = useState('all');

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.categories.includes(filter));

  return (
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold tracking-tighter mb-8">Key Projects & Experience</h2>
      
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-12">
        {['all', 'saas', 'web', 'api'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-all ${filter === f ? 'bg-brand/10 text-brand border-brand/50' : 'border-line text-gray-400 hover:border-brand/30'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <a href={proj.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white font-bold group-hover:text-brand transition-colors">
                    Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
            </div>
          </article>
        ))}
      </div>
      {filteredProjects.length === 0 && <p className="text-gray-500">No projects found for this category.</p>}
    </section>
  );
}
