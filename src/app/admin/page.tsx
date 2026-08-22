'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [expForm, setExpForm] = useState({ year: '', role: '', company: '', description: '' });
  const [projects, setProjects] = useState<any[]>([]);
  const [projForm, setProjForm] = useState({ title: '', description: '', imageUrl: '', projectUrl: '', categories: '', featuredText: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/experience').then(r => r.json()),
      fetch('/api/project').then(r => r.json())
    ]).then(([prof, exps, projs]) => {
      setProfile(prof);
      setExperiences(exps);
      setProjects(projs);
      setLoading(false);
    });
  }, [auth]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (pass === 'admin123') setAuth(true);
    else alert('Wrong password');
  };

  // Handlers
  const handleProfileUpdate = async (e: any) => {
    e.preventDefault();
    await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    alert('Profile updated');
  };

  const handleExpAdd = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/experience', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expForm) });
    if (res.ok) { setExperiences([await res.json(), ...experiences]); setExpForm({ year: '', role: '', company: '', description: '' }); }
  };

  const handleExpDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/experience/${id}`, { method: 'DELETE' });
    setExperiences(experiences.filter(exp => exp._id !== id));
  };

  const handleProjAdd = async (e: any) => {
    e.preventDefault();
    const payload = { ...projForm, categories: projForm.categories.split(',').map(c => c.trim()).filter(Boolean) };
    const res = await fetch('/api/project', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { setProjects([await res.json(), ...projects]); setProjForm({ title: '', description: '', imageUrl: '', projectUrl: '', categories: '', featuredText: '' }); }
  };

  const handleProjDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/project/${id}`, { method: 'DELETE' });
    setProjects(projects.filter(p => p._id !== id));
  };

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-surface border border-line p-8 rounded-2xl flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Admin Login</h2>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-ink border border-line p-3 rounded" placeholder="Password" />
        <button className="bg-brand text-ink font-bold py-2 rounded">Login</button>
      </form>
    </div>
  );

  if (loading) return <div className="p-24 text-center">Loading Admin...</div>;

  return (
    <div className="pt-32 px-6 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="flex gap-4 mb-8">
        {['profile', 'experience', 'projects'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-all ${activeTab === tab ? 'bg-brand/10 text-brand border-brand/50' : 'border-line text-gray-500'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'profile' && profile && (
        <form onSubmit={handleProfileUpdate} className="bg-surface border border-line p-6 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold mb-4 text-brand">Profile Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Title" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} />
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Location" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="GitHub URL" value={profile.githubUrl} onChange={e => setProfile({...profile, githubUrl: e.target.value})} />
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="LinkedIn URL" value={profile.linkedinUrl} onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} />
            <input className="col-span-2 w-full bg-ink border border-line p-3 rounded" placeholder="GitHub Username" value={profile.githubUsername} onChange={e => setProfile({...profile, githubUsername: e.target.value})} />
          </div>
          <textarea className="w-full bg-ink border border-line p-3 rounded h-24" placeholder="Bio" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
          <textarea className="w-full bg-ink border border-line p-3 rounded h-24" placeholder="About details" value={profile.about} onChange={e => setProfile({...profile, about: e.target.value})} />
          <button type="submit" className="bg-brand text-ink font-bold px-6 py-2 rounded">Update Profile</button>
        </form>
      )}

      {activeTab === 'experience' && (
        <>
          <form onSubmit={handleExpAdd} className="bg-surface border border-line p-6 rounded-2xl mb-8 space-y-4">
            <h2 className="text-xl font-bold mb-4 text-brand">Add Experience</h2>
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Year" value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} required />
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Role" value={expForm.role} onChange={e => setExpForm({...expForm, role: e.target.value})} required />
            <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Company" value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} required />
            <textarea className="w-full bg-ink border border-line p-3 rounded h-24" placeholder="Description" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} required />
            <button type="submit" className="bg-brand text-ink font-bold px-6 py-2 rounded">Save</button>
          </form>
          <div className="space-y-4">
            {experiences.map(exp => (
              <div key={exp._id} className="bg-card border border-line p-4 rounded flex justify-between items-center">
                <div><p className="text-xs text-brand">{exp.year}</p><h3 className="font-bold">{exp.role}</h3></div>
                <button onClick={() => handleExpDelete(exp._id)} className="text-red-400">Delete</button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'projects' && (
        <>
          <form onSubmit={handleProjAdd} className="bg-surface border border-line p-6 rounded-2xl mb-8 space-y-4">
            <h2 className="text-xl font-bold mb-4 text-brand">Add Project</h2>
            <div className="grid grid-cols-2 gap-4">
                <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Title" value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} required />
                <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Categories (web, api, saas)" value={projForm.categories} onChange={e => setProjForm({...projForm, categories: e.target.value})} required />
                <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Image URL" value={projForm.imageUrl} onChange={e => setProjForm({...projForm, imageUrl: e.target.value})} required />
                <input className="w-full bg-ink border border-line p-3 rounded" placeholder="Project Link" value={projForm.projectUrl} onChange={e => setProjForm({...projForm, projectUrl: e.target.value})} required />
            </div>
            <textarea className="w-full bg-ink border border-line p-3 rounded h-24" placeholder="Description" value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} required />
            <button type="submit" className="bg-brand text-ink font-bold px-6 py-2 rounded">Save Project</button>
          </form>
          <div className="space-y-4">
            {projects.map(proj => (
              <div key={proj._id} className="bg-card border border-line p-4 rounded flex justify-between items-center">
                <div><h3 className="font-bold">{proj.title}</h3></div>
                <button onClick={() => handleProjDelete(proj._id)} className="text-red-400">Delete</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
