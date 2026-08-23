import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    if (process.env.MONGODB_URI) {
      await dbConnect();
      const post = await BlogPost.findOne({ slug: resolvedParams.slug });
      if (post) {
        return {
          title: `${post.title} | Blog`,
          description: post.excerpt,
          openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [post.coverImage] : [],
          },
        };
      }
    }
  } catch (err) {}
  return { title: 'Blog Post' };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let post = null;

  try {
    if (process.env.MONGODB_URI) {
      await dbConnect();
      const dbPost = await BlogPost.findOne({ slug: resolvedParams.slug });
      if (dbPost && (dbPost.published || process.env.NODE_ENV === 'development')) {
        post = JSON.parse(JSON.stringify(dbPost));
      }
    }
  } catch (err) {
    console.warn('MongoDB connection fallback:', err);
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="relative z-10 pt-28 pb-24 px-4 sm:px-6 max-w-3xl mx-auto min-h-screen">
       <div className="mb-8 reveal">
        <Link href="/blog" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand transition-colors mb-8">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Blog
        </Link>
        
        <div className="flex flex-wrap gap-2 mb-6">
           {post.tags?.map((tag: string) => (
             <span key={tag} className="px-3 py-1 bg-brand/10 text-brand font-bold text-xs uppercase tracking-widest rounded-full border border-brand/20">
               {tag}
             </span>
           ))}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-800 dark:text-gray-100 mb-6 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 pb-8 border-b border-line">
           <span className="flex items-center gap-1.5">
             <Calendar className="w-4 h-4" /> 
             {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
           </span>
        </div>
      </div>

      {post.coverImage && (
        <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 border border-line bg-slate-100 dark:bg-black/20 reveal">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-slate dark:prose-invert prose-brand max-w-none prose-headings:tracking-tight prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:border prose-img:border-line reveal">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}