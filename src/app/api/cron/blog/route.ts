import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Parser from 'rss-parser';
import OpenAI from 'openai';

const parser = new Parser();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RSS_FEEDS = [
  'https://news.ycombinator.com/rss',
  'https://techcrunch.com/feed/',
  'https://feeds.feedburner.com/TheHackersNews',
];

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
}

export async function GET(request: Request) {
  try {
    // Vercel Cron Security Check
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API key missing' }, { status: 500 });
    }

    await dbConnect();

    // Pick a random feed
    const randomFeed = RSS_FEEDS[Math.floor(Math.random() * RSS_FEEDS.length)];
    const feed = await parser.parseURL(randomFeed);

    if (!feed.items || feed.items.length === 0) {
        return NextResponse.json({ message: 'No items in feed' });
    }

    // Pick the top item (or random from top 5)
    const item = feed.items[Math.floor(Math.random() * Math.min(5, feed.items.length))];
    
    // Check if we already have a blog post about this link (using original title as slug basis or checking content)
    // To keep it simple, we just generate a new post for now. In a real app, you might check if `item.link` is already in the DB.

    const prompt = `
    You are a professional tech blogger. I will give you a news article title, description, and link. 
    Write an engaging, SEO-optimized blog post in Turkish about this news.
    
    Source Title: ${item.title}
    Source Link: ${item.link}
    Source Content/Description: ${item.content || item.contentSnippet || item.summary || 'No description provided.'}
    
    Requirements:
    1. Write entirely in Turkish.
    2. Start with an engaging H1 title (in Turkish, do NOT use the exact source title if it's English, translate and make it catchy).
    3. Provide a short Excerpt (1-2 sentences) at the very beginning, enclosed in <excerpt></excerpt> tags.
    4. Write 3-4 paragraphs of content. Explain what it is, why it matters for developers/tech world.
    5. Provide 3-5 relevant comma-separated tags at the very end, enclosed in <tags></tags> tags.
    6. Format the main body in Markdown.
    7. Include the source link at the end: "Kaynak: [LinkText](${item.link})"
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini', 
    });

    const aiResponse = completion.choices[0].message.content || '';

    // Parse the AI response
    const excerptMatch = aiResponse.match(/<excerpt>([\s\S]*?)<\/excerpt>/);
    const tagsMatch = aiResponse.match(/<tags>([\s\S]*?)<\/tags>/);
    
    const excerpt = excerptMatch ? excerptMatch[1].trim() : 'Teknoloji dünyasından en son gelişmeler.';
    const tagsStr = tagsMatch ? tagsMatch[1].trim() : 'teknoloji, haber, yazılım';
    const tags = tagsStr.split(',').map((t) => t.trim());

    // Clean up the main content (remove the custom XML tags)
    let content = aiResponse
      .replace(/<excerpt>[\s\S]*?<\/excerpt>/g, '')
      .replace(/<tags>[\s\S]*?<\/tags>/g, '')
      .trim();

    // Extract title (assume first line starting with # is title)
    let title = item.title || 'Teknoloji Haberi';
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
      // Remove the title from content to avoid duplication if it's meant to be the H1
      content = content.replace(/^#\s+(.+)$/m, '').trim();
    }

    const slug = generateSlug(title);

    const newPost = await BlogPost.create({
      title,
      slug,
      content,
      excerpt,
      tags,
      published: true, 
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', // Default tech placeholder
    });

    return NextResponse.json({ message: 'Blog post auto-generated successfully', post: newPost });

  } catch (error: any) {
    console.error('Auto-blog error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
