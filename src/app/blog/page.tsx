import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

export const revalidate = 3600;

export default async function BlogPage() {
  let posts = [];

  try {
    if (process.env.MONGODB_URI) {
      await dbConnect();
      const dbPosts = await BlogPost.find({ published: true }).sort({ createdAt: -1 });
      if (dbPosts && dbPosts.length > 0) {
        posts = JSON.parse(JSON.stringify(dbPosts));
      }
    }
  } catch (err) {
    console.warn('MongoDB connection fallback:', err);
  }

  return (
    <div className="relative z-10 pt-28 pb-24 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12 reveal">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand transition-colors mb-6">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-800 dark:text-gray-200 mb-4">Blog</h1>
        <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl">Thoughts on software engineering, web development, and the tools I use.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 reveal-stagger">
        {posts.length > 0 ? posts.map((post: any) => (
          <Link key={post._id} href={`/blog/${post.slug}`} className="group flex flex-col bg-surface border border-line rounded-3xl overflow-hidden hover:border-brand/30 hover:shadow-xl transition-all card-lift">
            {post.coverImage ? (
               <div className="w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-black/20">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={post.coverImage} 
                  alt={post.title}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-full aspect-[16/9] bg-slate-100 dark:bg-ink/50 flex items-center justify-center">
                 <span className="text-4xl">📝</span>
              </div>
            )}
            
            <div className="p-6 sm:p-8 flex flex-col flex-grow">
              <div className="flex flex-wrap gap-2 mb-4">
                 {post.tags?.map((tag: string) => (
                   <span key={tag} className="px-2.5 py-1 bg-brand/5 text-brand font-medium text-[10px] uppercase tracking-wider rounded-md border border-brand/10">
                     {tag}
                   </span>
                 ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-200 mb-3 group-hover:text-brand transition-colors">{post.title}</h2>
              <p className="text-slate-600 dark:text-gray-400 text-sm mb-6 flex-grow line-clamp-3">{post.excerpt}</p>
              
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-auto pt-4 border-t border-line/50">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center text-brand group-hover:translate-x-1 transition-transform">
                  Read <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </Link>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-500">
            <p>No posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}