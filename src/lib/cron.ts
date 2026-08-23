import cron from 'node-cron';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Parser from 'rss-parser';
import OpenAI from 'openai';

const parser = new Parser();

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

// Track if cron is already initialized to prevent multiple instances in dev
let isCronStarted = false;

export function initCronJobs() {
  if (isCronStarted) return;
  isCronStarted = true;

  console.log('🤖 Auto-Blogging Cron Job Initialized (Runs every 10 minutes)');

  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('🤖 Running Auto-Blogging Task...', new Date().toISOString());
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OPENAI_API_KEY is not set. Auto-blogging skipped.');
        return;
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      await dbConnect();

      // Pick a random feed
      const randomFeed = RSS_FEEDS[Math.floor(Math.random() * RSS_FEEDS.length)];
      const feed = await parser.parseURL(randomFeed);

      if (!feed.items || feed.items.length === 0) {
        console.log('No items found in feed:', randomFeed);
        return;
      }

      // Pick a random item from the top 5
      const item = feed.items[Math.floor(Math.random() * Math.min(5, feed.items.length))];
      
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

      // Clean up the main content
      let content = aiResponse
        .replace(/<excerpt>[\s\S]*?<\/excerpt>/g, '')
        .replace(/<tags>[\s\S]*?<\/tags>/g, '')
        .trim();

      // Extract title
      let title = item.title || 'Teknoloji Haberi';
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1].trim();
        content = content.replace(/^#\s+(.+)$/m, '').trim();
      }

      const slug = generateSlug(title);

      await BlogPost.create({
        title,
        slug,
        content,
        excerpt,
        tags,
        published: true, 
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', 
      });

      console.log(`✅ Auto-Blog created: ${title}`);

    } catch (error) {
      console.error('❌ Auto-blog error:', error);
    }
  });
}
