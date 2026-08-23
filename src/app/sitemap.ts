import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';

export const revalidate = 3600; // Cache for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ibrahimhalilsezgin.com';

  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    if (process.env.MONGODB_URI) {
      await dbConnect();
      const posts = await BlogPost.find({ published: true }).select('slug updatedAt createdAt');
      
      blogUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.createdAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogUrls,
  ];
}