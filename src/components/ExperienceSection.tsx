import dbConnect from '@/lib/db';
import Experience from '@/models/Experience';

async function getExperiences() {
  await dbConnect();
  const exps = await Experience.find({}).sort({ order: 1, createdAt: -1 });
  return JSON.parse(JSON.stringify(exps));
}

export default async function ExperienceSection() {
  const experiences = await getExperiences();

  if (experiences.length === 0) return null;

  return (
    <section id="experience" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-bold tracking-tighter">Experience</h2>
            <p className="mono text-xs text-gray-500">CAREER PATH</p>
        </div>
        <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-line md:-translate-x-px"></div>

            {experiences.map((exp: any, idx: number) => {
              const isRight = idx % 2 === 0;
              return (
                <div key={exp._id} className="relative flex flex-col md:flex-row mb-12 group">
                    {/* Desktop Right Align (Item on Left) */}
                    <div className={`hidden md:block md:w-1/2 md:pr-12 md:text-right ${!isRight ? 'invisible' : ''}`}>
                        {isRight && (
                          <div className="p-6 bg-surface/80 backdrop-blur-sm border border-line rounded-2xl inline-block text-left md:text-right">
                              <span className="mono text-[10px] text-brand uppercase tracking-widest">{exp.year}</span>
                              <h3 className="text-xl font-bold mt-2">{exp.role}</h3>
                              <p className="text-brand text-sm font-medium">{exp.company}</p>
                              <p className="text-gray-400 text-sm mt-3">{exp.description}</p>
                          </div>
                        )}
                    </div>
                    
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-brand rounded-full border-4 border-ink -translate-x-1/2 mt-8 z-10 group-hover:scale-150 transition-transform"></div>
                    
                    {/* Mobile & Desktop Left Align (Item on Right) */}
                    <div className="md:w-1/2 md:pl-12 pl-12">
                        {(!isRight || true) && ( // Always show on mobile, hide on desktop if it's a 'right' item
                          <div className={`p-6 bg-surface/80 backdrop-blur-sm border border-line rounded-2xl ${isRight ? 'md:hidden' : ''}`}>
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
  );
}
