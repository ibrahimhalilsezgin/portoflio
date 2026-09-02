'use client';
// ponytail: admin page — noindex set in layout metadata
import { useState, useEffect } from 'react';

const tabs = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'experience', label: 'Experience', icon: '💼' },
  { key: 'projects', label: 'Projects', icon: '🚀' },
  { key: 'blogs', label: 'Blogs', icon: '📝' },
  { key: 'comments', label: 'Comments', icon: '💬' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
      <input {...props} className="w-full bg-white dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-800 dark:text-gray-200 shadow-sm" />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
      <textarea {...props} className="w-full bg-white dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-800 dark:text-gray-200 shadow-sm" />
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 bg-slate-800 dark:bg-brand text-white dark:text-ink px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-black/10 dark:shadow-brand/20 animate-[slideUp_0.3s_ease] z-50">
      {message}
    </div>
  );
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('profile');
  const [profile, setProfile] = useState<any>(null);
  
  const [experiences, setExperiences] = useState<any[]>([]);
  const [expForm, setExpForm] = useState({ year: '', role: '', company: '', description: '' });
  const [editingExpId, setEditingExpId] = useState<string | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [projForm, setProjForm] = useState({ title: '', description: '', imageUrl: '', projectUrl: '', categories: '', featuredText: '' });
  const [editingProjId, setEditingProjId] = useState<string | null>(null);

  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogForm, setBlogForm] = useState({ title: '', slug: '', content: '', excerpt: '', coverImage: '', tags: '', published: false });
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  const [comments, setComments] = useState<any[]>([]);

  const [settings, setSettings] = useState<any>({ 
    activeProvider: 'openai',
    openaiModel: 'gpt-4o-mini', 
    openaiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    geminiApiKey: '',
    nvidiaModel: 'meta/llama-3.1-70b-instruct',
    nvidiaApiKey: ''
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!auth) return;
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/experience').then(r => r.json()),
      fetch('/api/project').then(r => r.json()),
      fetch('/api/blog?all=true').then(r => r.json()),
      fetch('/api/comment?all=true').then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]).then(([prof, exps, projs, blgs, cmts, sets]) => {
      setProfile(prof);
      setExperiences(Array.isArray(exps) ? exps : []);
      setProjects(Array.isArray(projs) ? projs : []);
      setBlogs(Array.isArray(blgs) ? blgs : []);
      setComments(Array.isArray(cmts) ? cmts : []);
      if (sets && !sets.error) {
        setSettings({ 
          activeProvider: sets.activeProvider || 'openai',
          openaiModel: sets.openaiModel || 'gpt-4o-mini', 
          openaiApiKey: sets.hasOpenaiApiKey ? (sets.maskedOpenaiApiKey || '********') : '',
          geminiModel: sets.geminiModel || 'gemini-2.5-flash',
          geminiApiKey: sets.hasGeminiApiKey ? (sets.maskedGeminiApiKey || '********') : '',
          nvidiaModel: sets.nvidiaModel || 'meta/llama-3.1-70b-instruct',
          nvidiaApiKey: sets.hasNvidiaApiKey ? (sets.maskedNvidiaApiKey || '********') : '',
        });
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [auth]);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      if (res.ok) {
        setAuth(true);
      } else {
        setLoginError('Invalid password');
      }
    } catch {
      setLoginError('Connection error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleProfileUpdate = async (e: any) => {
    e.preventDefault();
    await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    setToast('Profile updated successfully');
  };

  const handleSettingsUpdate = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/settings', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(settings) 
    });
    if (res.ok) {
      setToast('Settings updated successfully');
    } else {
      setToast('Error updating settings');
    }
  };

  const handleExpAdd = async (e: any) => {
    e.preventDefault();
    if (editingExpId) {
      const res = await fetch(`/api/experience/${editingExpId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expForm) });
      if (res.ok) {
        const updated = await res.json();
        setExperiences(experiences.map(ex => ex._id === editingExpId ? updated : ex));
        setExpForm({ year: '', role: '', company: '', description: '' });
        setEditingExpId(null);
        setToast('Experience updated');
      }
    } else {
      const res = await fetch('/api/experience', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expForm) });
      if (res.ok) {
        setExperiences([await res.json(), ...experiences]);
        setExpForm({ year: '', role: '', company: '', description: '' });
        setToast('Experience added');
      }
    }
  };

  const handleExpEdit = (exp: any) => {
    setEditingExpId(exp._id);
    setExpForm({ year: exp.year, role: exp.role, company: exp.company, description: exp.description });
  };

  const handleExpCancelEdit = () => {
    setEditingExpId(null);
    setExpForm({ year: '', role: '', company: '', description: '' });
  };

  const handleExpDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    await fetch(`/api/experience/${id}`, { method: 'DELETE' });
    setExperiences(experiences.filter(exp => exp._id !== id));
    if (editingExpId === id) handleExpCancelEdit();
    setToast('Experience deleted');
  };

  const handleProjAdd = async (e: any) => {
    e.preventDefault();
    const payload = { ...projForm, categories: typeof projForm.categories === 'string' ? projForm.categories.split(',').map((c: string) => c.trim()).filter(Boolean) : projForm.categories };
    
    if (editingProjId) {
      const res = await fetch(`/api/project/${editingProjId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const updated = await res.json();
        setProjects(projects.map(p => p._id === editingProjId ? updated : p));
        setProjForm({ title: '', description: '', imageUrl: '', projectUrl: '', categories: '', featuredText: '' });
        setEditingProjId(null);
        setToast('Project updated');
      }
    } else {
      const res = await fetch('/api/project', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setProjects([await res.json(), ...projects]);
        setProjForm({ title: '', description: '', imageUrl: '', projectUrl: '', categories: '', featuredText: '' });
        setToast('Project added');
      }
    }
  };

  const handleProjEdit = (proj: any) => {
    setEditingProjId(proj._id);
    setProjForm({ 
      title: proj.title, 
      description: proj.description, 
      imageUrl: proj.imageUrl, 
      projectUrl: proj.projectUrl, 
      categories: proj.categories?.join(', ') || '', 
      featuredText: proj.featuredText || '' 
    });
  };

  const handleProjCancelEdit = () => {
    setEditingProjId(null);
    setProjForm({ title: '', description: '', imageUrl: '', projectUrl: '', categories: '', featuredText: '' });
  };

  const handleProjDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/project/${id}`, { method: 'DELETE' });
    setProjects(projects.filter(p => p._id !== id));
    if (editingProjId === id) handleProjCancelEdit();
    setToast('Project deleted');
  };

  // ── Login Screen ──
  const saveBlog = async () => {
    try {
      const payload = {
        ...blogForm,
        tags: blogForm.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingBlogId) {
        const res = await fetch(`/api/blog/${editingBlogId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          const updated = await res.json();
          setBlogs(blogs.map(b => b._id === editingBlogId ? updated : b));
          setToast('Blog updated');
          setEditingBlogId(null);
          setBlogForm({ title: '', slug: '', content: '', excerpt: '', coverImage: '', tags: '', published: false });
        }
      } else {
        const res = await fetch('/api/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
          const created = await res.json();
          setBlogs([created, ...blogs]);
          setToast('Blog added');
          setBlogForm({ title: '', slug: '', content: '', excerpt: '', coverImage: '', tags: '', published: false });
        }
      }
    } catch (e) {
      console.error(e);
      setToast('Error saving blog');
    }
  };

  const editBlog = (b: any) => {
    setEditingBlogId(b._id);
    setBlogForm({
      title: b.title || '',
      slug: b.slug || '',
      content: b.content || '',
      excerpt: b.excerpt || '',
      coverImage: b.coverImage || '',
      tags: (b.tags || []).join(', '),
      published: b.published || false
    });
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Delete blog post?')) return;
    try {
      await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      setBlogs(blogs.filter(b => b._id !== id));
      setToast('Blog deleted');
    } catch (e) {
      console.error(e);
      setToast('Error deleting blog');
    }
  };

  const toggleCommentApproval = async (c: any) => {
    try {
      const res = await fetch(`/api/comment/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: !c.approved }) });
      if (res.ok) {
        const updated = await res.json();
        setComments(comments.map(comment => comment._id === c._id ? updated : comment));
        setToast(`Comment ${updated.approved ? 'approved' : 'hidden'}`);
      }
    } catch (e) {
      console.error(e);
      setToast('Error updating comment');
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Delete comment?')) return;
    try {
      await fetch(`/api/comment/${id}`, { method: 'DELETE' });
      setComments(comments.filter(c => c._id !== id));
      setToast('Comment deleted');
    } catch (e) {
      console.error(e);
      setToast('Error deleting comment');
    }
  };

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ink">
      <div className="w-full max-w-sm">
        <div className="bg-surface/80 backdrop-blur-xl border border-line/50 rounded-3xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/20">
          <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-1 text-slate-800 dark:text-gray-200">Admin Panel</h2>
          <p className="text-slate-500 dark:text-gray-500 text-sm text-center mb-8">Enter your password to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={pass}
                onChange={e => { setPass(e.target.value); setLoginError(''); }}
                className="w-full bg-white dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-800 dark:text-gray-200 shadow-sm"
                placeholder="Password"
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-red-400 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={loginLoading || !pass}
              className="w-full bg-brand text-white dark:text-ink font-semibold py-3.5 rounded-xl transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-sm"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-500 dark:text-gray-600 mt-6">Portfolio Admin Panel</p>
      </div>
    </div>
  );

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  // ── Dashboard ──
  return (
    <div className="pt-28 px-4 sm:px-6 max-w-5xl mx-auto pb-24 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-200">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">Manage your portfolio content</p>
        </div>
        <button onClick={() => { setAuth(false); setPass(''); }} className="text-xs text-slate-500 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-line/50 bg-white dark:bg-transparent shadow-sm dark:shadow-none px-4 py-2 rounded-xl">
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Experiences', count: experiences.length, color: 'text-blue-500 dark:text-blue-400' },
          { label: 'Projects', count: projects.length, color: 'text-emerald-500 dark:text-emerald-400' },
          { label: 'Profile', count: profile ? 1 : 0, color: 'text-brand' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-5 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white/60 dark:bg-surface/40 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-1.5 shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all relative ${
              activeTab === tab.key
                ? 'bg-brand/10 text-brand shadow-sm'
                : 'text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="uppercase tracking-wider">{tab.label}</span>
            {tab.key === 'comments' && comments.filter(c => !c.approved).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {comments.filter(c => !c.approved).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && profile && (
        <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand text-lg">👤</div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">Profile Settings</h2>
              <p className="text-xs text-slate-500 dark:text-gray-500">Update your personal information</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Name" placeholder="Full name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            <Input label="Title" placeholder="Job title" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} />
            <Input label="Location" placeholder="City, Country" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
            <Input label="Email" placeholder="your@email.com" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
            <Input label="GitHub URL" placeholder="https://github.com/..." value={profile.githubUrl} onChange={e => setProfile({...profile, githubUrl: e.target.value})} />
            <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." value={profile.linkedinUrl} onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} />
            <div className="sm:col-span-2">
              <Input label="GitHub Username" placeholder="username" value={profile.githubUsername} onChange={e => setProfile({...profile, githubUsername: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 mt-5">
            <Textarea label="Bio" placeholder="Short bio..." value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={3} />
            <Textarea label="About" placeholder="Detailed about section..." value={profile.about} onChange={e => setProfile({...profile, about: e.target.value})} rows={5} />
          </div>
          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-brand text-white dark:text-ink font-semibold px-8 py-3 rounded-xl text-sm hover:brightness-110 transition-all shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* ── Experience Tab ── */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <form onSubmit={handleExpAdd} className="bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400 text-lg">💼</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">{editingExpId ? 'Edit Experience' : 'Add Experience'}</h2>
                <p className="text-xs text-slate-500 dark:text-gray-500">{editingExpId ? 'Update this experience entry' : 'Add a new work experience entry'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Input label="Year" placeholder="2024 - Present" value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} required />
              <Input label="Role" placeholder="Full-Stack Developer" value={expForm.role} onChange={e => setExpForm({...expForm, role: e.target.value})} required />
              <Input label="Company" placeholder="Company name" value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} required />
            </div>
            <div className="mt-5">
              <Textarea label="Description" placeholder="What did you do..." value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} rows={3} required />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {editingExpId && (
                <button type="button" onClick={handleExpCancelEdit} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-200 font-semibold px-6 py-3 rounded-xl text-sm hover:brightness-95 dark:hover:brightness-110 transition-all shadow-sm">
                  Cancel
                </button>
              )}
              <button type="submit" className="bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:brightness-110 transition-all shadow-sm">
                {editingExpId ? 'Update Experience' : 'Add Experience'}
              </button>
            </div>
          </form>

          {experiences.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400 px-1">Existing Entries ({experiences.length})</h3>
              {experiences.map(exp => (
                <div key={exp._id} className="bg-white dark:bg-surface/40 backdrop-blur border border-slate-200 dark:border-line/20 rounded-2xl p-5 flex items-center justify-between group hover:border-slate-300 dark:hover:border-line/40 transition-all shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-gray-200">{exp.role}</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">{exp.company} &middot; {exp.year}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleExpEdit(exp)}
                      className="text-xs text-slate-600 dark:text-gray-400 hover:text-blue-500 transition-colors border border-slate-200 dark:border-line/30 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-transparent"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleExpDelete(exp._id)}
                      className="text-xs text-slate-600 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-line/30 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-transparent"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Projects Tab ── */}
      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); saveBlog(); }} className="bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-lg">📝</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">{editingBlogId ? 'Edit Blog' : 'Add Blog'}</h2>
                <p className="text-xs text-slate-500 dark:text-gray-500">{editingBlogId ? 'Update blog details' : 'Write a new blog post'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <Input label="Title" value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} placeholder="Blog post title" required />
              <Input label="Slug" value={blogForm.slug} onChange={e => setBlogForm({ ...blogForm, slug: e.target.value })} placeholder="blog-post-title" />
              <Input label="Cover Image URL" value={blogForm.coverImage} onChange={e => setBlogForm({ ...blogForm, coverImage: e.target.value })} placeholder="https://..." />
              <Textarea label="Excerpt" value={blogForm.excerpt} onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })} placeholder="Short summary" required />
              <Textarea label="Content (Markdown)" value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} placeholder="# Heading..." rows={10} required />
              <Input label="Tags (comma separated)" value={blogForm.tags} onChange={e => setBlogForm({ ...blogForm, tags: e.target.value })} placeholder="react, typescript, nextjs" />
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
                <input type="checkbox" checked={blogForm.published} onChange={e => setBlogForm({ ...blogForm, published: e.target.checked })} className="rounded bg-slate-200 dark:bg-ink border-transparent focus:ring-brand" />
                Published
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              {editingBlogId && (
                <button type="button" onClick={() => { setEditingBlogId(null); setBlogForm({ title: '', slug: '', content: '', excerpt: '', coverImage: '', tags: '', published: false }); }} className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-line/50 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-line/20 transition-all">Cancel</button>
              )}
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-all shadow-sm">{editingBlogId ? 'Update' : 'Add'} Blog</button>
            </div>
          </form>

          <div className="space-y-4">
            {blogs.map(b => (
              <div key={b._id} className="bg-white dark:bg-surface/40 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-brand/30">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-2">
                    {b.title}
                    {b.published ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded-full">Published</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase rounded-full">Draft</span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">{b.excerpt}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => editBlog(b)} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 dark:bg-line/30 hover:bg-slate-200 dark:hover:bg-line/50 text-slate-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors">Edit</button>
                  <button onClick={() => deleteBlog(b._id)} className="flex-1 sm:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium transition-colors">Delete</button>
                </div>
              </div>
            ))}
            {blogs.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-gray-500 bg-white/50 dark:bg-surface/20 rounded-2xl border border-dashed border-slate-300 dark:border-line/50">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-sm">No blogs added yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          <form onSubmit={handleProjAdd} className="bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 dark:text-emerald-400 text-lg">🚀</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">{editingProjId ? 'Edit Project' : 'Add Project'}</h2>
                <p className="text-xs text-slate-500 dark:text-gray-500">{editingProjId ? 'Update this project' : 'Showcase a new project'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Title" placeholder="Project name" value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} required />
              <Input label="Categories" placeholder="web, api, saas" value={projForm.categories} onChange={e => setProjForm({...projForm, categories: e.target.value})} required />
              <Input label="Image URL" placeholder="https://..." value={projForm.imageUrl} onChange={e => setProjForm({...projForm, imageUrl: e.target.value})} required />
              <Input label="Project URL" placeholder="https://..." value={projForm.projectUrl} onChange={e => setProjForm({...projForm, projectUrl: e.target.value})} required />
              <Input label="Featured Text" placeholder="Featured SaaS" value={projForm.featuredText} onChange={e => setProjForm({...projForm, featuredText: e.target.value})} />
            </div>
            <div className="mt-5">
              <Textarea label="Description" placeholder="What does this project do..." value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} rows={3} required />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {editingProjId && (
                <button type="button" onClick={handleProjCancelEdit} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-200 font-semibold px-6 py-3 rounded-xl text-sm hover:brightness-95 dark:hover:brightness-110 transition-all shadow-sm">
                  Cancel
                </button>
              )}
              <button type="submit" className="bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:brightness-110 transition-all shadow-sm">
                {editingProjId ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </form>

          {projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400 px-1">Existing Projects ({projects.length})</h3>
              {projects.map(proj => (
                <div key={proj._id} className="bg-white dark:bg-surface/40 backdrop-blur border border-slate-200 dark:border-line/20 rounded-2xl p-5 flex items-center justify-between group hover:border-slate-300 dark:hover:border-line/40 transition-all shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-gray-200">{proj.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">{proj.categories?.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleProjEdit(proj)}
                      className="text-xs text-slate-600 dark:text-gray-400 hover:text-emerald-500 transition-colors border border-slate-200 dark:border-line/30 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-transparent"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleProjDelete(proj._id)}
                      className="text-xs text-slate-600 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-line/30 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-transparent"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 dark:text-rose-400 text-lg">💬</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">Manage Comments</h2>
                <p className="text-xs text-slate-500 dark:text-gray-500">Approve or delete incoming comments</p>
              </div>
            </div>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-gray-500 border border-dashed border-slate-300 dark:border-line/50 rounded-2xl">
                  <p className="text-sm">No comments yet.</p>
                </div>
              ) : (
                comments.map(c => (
                  <div key={c._id} className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start gap-4 ${c.approved ? 'bg-slate-50 dark:bg-surface/20 border-slate-200 dark:border-line/20' : 'bg-brand/5 border-brand/20'}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 dark:text-gray-200">{c.name}</h4>
                        {c.role && <span className="text-xs text-slate-500 dark:text-gray-400">({c.role})</span>}
                        {!c.approved && <span className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-bold uppercase rounded-full">New</span>}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">{c.content}</p>
                      <p className="text-[10px] text-slate-400 mt-2">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => toggleCommentApproval(c)} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium transition-colors ${c.approved ? 'bg-slate-200 dark:bg-line/40 text-slate-700 dark:text-gray-300 hover:bg-slate-300' : 'bg-brand text-white hover:bg-brand/90'}`}>
                        {c.approved ? 'Hide' : 'Approve'}
                      </button>
                      <button onClick={() => deleteComment(c._id)} className="flex-1 sm:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSettingsUpdate} className="bg-white dark:bg-surface/60 backdrop-blur border border-slate-200 dark:border-line/30 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-500/10 rounded-xl flex items-center justify-center text-slate-500 text-lg">⚙️</div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-gray-200">System Settings</h2>
              <p className="text-xs text-slate-500 dark:text-gray-500">Configure AI auto-blogging providers and API keys</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Active AI Provider</label>
            <div className="flex gap-4">
              {['openai', 'gemini', 'nvidia'].map(provider => (
                <label key={provider} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="activeProvider" 
                    value={provider}
                    checked={settings.activeProvider === provider}
                    onChange={e => setSettings({...settings, activeProvider: e.target.value})}
                    className="text-brand focus:ring-brand"
                  />
                  <span className="text-sm font-medium capitalize text-slate-700 dark:text-gray-300">{provider}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-slate-200 dark:border-line/30 rounded-xl mb-6 bg-slate-50/50 dark:bg-ink/30">
            <div className="col-span-full">
              <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 mb-1">OpenAI Settings</h3>
              <p className="text-xs text-slate-500">Used if active provider is OpenAI</p>
            </div>
            <Input 
              label="OpenAI Model" 
              placeholder="e.g. gpt-4o-mini" 
              value={settings.openaiModel} 
              onChange={e => setSettings({...settings, openaiModel: e.target.value})} 
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">OpenAI API Key</label>
              <input 
                type="password"
                value={settings.openaiApiKey} 
                onChange={e => setSettings({...settings, openaiApiKey: e.target.value})}
                placeholder="sk-..."
                className="w-full bg-white dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-800 dark:text-gray-200 shadow-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-slate-200 dark:border-line/30 rounded-xl mb-6 bg-slate-50/50 dark:bg-ink/30">
            <div className="col-span-full">
              <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 mb-1">Google Gemini Settings</h3>
              <p className="text-xs text-slate-500">Used if active provider is Gemini</p>
            </div>
            <Input 
              label="Gemini Model" 
              placeholder="e.g. gemini-2.5-flash" 
              value={settings.geminiModel} 
              onChange={e => setSettings({...settings, geminiModel: e.target.value})} 
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Gemini API Key</label>
              <input 
                type="password"
                value={settings.geminiApiKey} 
                onChange={e => setSettings({...settings, geminiApiKey: e.target.value})}
                placeholder="AIza..."
                className="w-full bg-white dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-800 dark:text-gray-200 shadow-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-slate-200 dark:border-line/30 rounded-xl bg-slate-50/50 dark:bg-ink/30">
            <div className="col-span-full">
              <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200 mb-1">NVIDIA NIM Settings</h3>
              <p className="text-xs text-slate-500">Used if active provider is NVIDIA NIM (OpenAI compatible)</p>
            </div>
            <Input 
              label="NVIDIA Model" 
              placeholder="e.g. meta/llama-3.1-70b-instruct" 
              value={settings.nvidiaModel} 
              onChange={e => setSettings({...settings, nvidiaModel: e.target.value})} 
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">NVIDIA API Key</label>
              <input 
                type="password"
                value={settings.nvidiaApiKey} 
                onChange={e => setSettings({...settings, nvidiaApiKey: e.target.value})}
                placeholder="nvapi-..."
                className="w-full bg-white dark:bg-ink/50 border border-slate-200 dark:border-line/50 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 text-slate-800 dark:text-gray-200 shadow-sm" 
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl text-sm hover:brightness-110 transition-all shadow-sm">
              Save Settings
            </button>
          </div>
        </form>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
