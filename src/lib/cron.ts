import cron from 'node-cron';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import Settings from '@/models/Settings';
import { decrypt } from '@/lib/crypto';
import Parser from 'rss-parser';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

const parser = new Parser();

const RSS_FEEDS = [
  'https://news.ycombinator.com/rss',
  'https://techcrunch.com/feed/',
  'https://feeds.feedburner.com/TheHackersNews',
  'https://www.wired.com/feed/category/gear/latest/rss', // Hardware
  'https://www.artificialintelligence-news.com/feed/', // AI
];

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
}

let isCronStarted = false;

export function initCronJobs() {
  if (isCronStarted) return;
  isCronStarted = true;

  console.log('🤖 Auto-Blogging Cron Job Initialized (Runs every 10 minutes)');

  cron.schedule('*/10 * * * *', async () => {
    console.log('🤖 Running Auto-Blogging Task...', new Date().toISOString());
    
    try {
      await dbConnect();
      const settings = await Settings.findOne({ isSingleton: true });
      
      let provider = 'openai';
      let apiKey = process.env.OPENAI_API_KEY || '';
      let model = 'gpt-4o-mini';

      if (settings) {
        provider = settings.activeProvider || 'openai';
        if (provider === 'openai') {
          apiKey = settings.openaiApiKey ? (decrypt(settings.openaiApiKey) || apiKey) : apiKey;
          model = settings.openaiModel || 'gpt-4o-mini';
        } else if (provider === 'gemini') {
          apiKey = settings.geminiApiKey ? (decrypt(settings.geminiApiKey) || '') : '';
          model = settings.geminiModel || 'gemini-2.5-flash';
        } else if (provider === 'nvidia') {
          apiKey = settings.nvidiaApiKey ? (decrypt(settings.nvidiaApiKey) || '') : '';
          model = settings.nvidiaModel || 'meta/llama-3.1-70b-instruct';
        }
      }

      if (!apiKey) {
        console.warn(`⚠️ API Key for ${provider} is not set. Auto-blogging skipped.`);
        return;
      }

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
      Sen profesyonel bir teknoloji yazarısın. Sana verilen güncel haber içeriğinden ilham alarak veya o konuyu genişleterek bilgisayar, yazılım, donanım veya yapay zeka konularında (örneğin 2026 yılı vizyonuyla) harika bir SEO uyumlu Türkçe blog yazısı yaz.
      
      Kaynak Başlık: ${item.title}
      Kaynak Linki: ${item.link}
      Kaynak İçeriği: ${item.content || item.contentSnippet || item.summary || 'Açıklama yok.'}
      
      Kurallar:
      1. Tamamen TÜRKÇE yazacaksın.
      2. İlgi çekici bir H1 başlığı ile başla (İngilizce başlığı direkt çevirme, özgün ve akılda kalıcı olsun).
      3. Yazının en başında 1-2 cümlelik kısa bir özeti <excerpt></excerpt> etiketleri içine yaz.
      4. 3-4 paragraftan oluşan zengin, okunaklı, teknik detaya inen bir içerik oluştur. Özellikle yapay zeka, yeni donanımlar, yazılım trendleri veya bilgisayar mimarisi gibi fütüristik/derinlemesine açılara değin.
      5. En sonda 3-5 adet virgülle ayrılmış SEO etiketini <tags></tags> etiketleri içine ekle.
      6. Ana metni Markdown formatında şekillendir (alt başlıklar, kalın yazılar vs. kullan).
      7. En sona kaynak linkini şu şekilde ekle: "Kaynak: [Haberin Aslı](${item.link})"
      `;

      let aiResponse = '';

      if (provider === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        aiResponse = response.text || '';
      } else {
        // Both OpenAI and NVIDIA NIM use the OpenAI SDK compatibility layer
        const baseURL = provider === 'nvidia' ? 'https://integrate.api.nvidia.com/v1' : undefined;
        
        const openai = new OpenAI({
          apiKey: apiKey,
          baseURL: baseURL,
        });

        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: model, 
        });
        aiResponse = completion.choices[0].message.content || '';
      }

      // Parse the AI response
      const excerptMatch = aiResponse.match(/<excerpt>([\s\S]*?)<\/excerpt>/);
      const tagsMatch = aiResponse.match(/<tags>([\s\S]*?)<\/tags>/);
      
      const excerpt = excerptMatch ? excerptMatch[1].trim() : 'Teknoloji dünyasından en son gelişmeler.';
      const tagsStr = tagsMatch ? tagsMatch[1].trim() : 'teknoloji, yazılım, yapay zeka, donanım';
      const tags = tagsStr.split(',').map((t) => t.trim().replace(/^#/, '')); // Remove # if AI adds it

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

      console.log(`✅ Auto-Blog created via ${provider}: ${title}`);

    } catch (error) {
      console.error('❌ Auto-blog error:', error);
    }
  });
}
