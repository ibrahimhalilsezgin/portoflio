import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

const SITE_URL = "https://ibrahimhalilsezgin.com";

async function getPost(slug: string) {
  try {
    if (process.env.MONGODB_URI) {
      await dbConnect();
      return await BlogPost.findOne({ slug });
    }
  } catch {}
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  if (!post) return { title: 'Blog Post' };

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.createdAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: ["İbrahim Halil Sezgin"],
      tags: post.tags,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
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

  // BlogPosting JSON-LD — critical for GEO and Google rich results
  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "url": `${SITE_URL}/blog/${post.slug}`,
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "author": {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      "name": "İbrahim Halil Sezgin",
    },
    "publisher": {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      "name": "İbrahim Halil Sezgin",
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    "inLanguage": "tr-TR",
    "keywords": post.tags?.join(", "),
    ...(post.coverImage && { "image": post.coverImage }),
  };

  // BreadcrumbList for this blog post
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `${SITE_URL}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([blogPostingLd, breadcrumbLd]) }}
      />
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
    </>
  );
}