import dbConnect from './db';
import Profile from '../models/Profile';
import Experience from '../models/Experience';
import Project from '../models/Project';

export async function seedDatabase() {
  await dbConnect();

  // 1. Profile
  const profileCount = await Profile.countDocuments();
  if (profileCount === 0) {
    await Profile.create({
      name: 'İbrahim Halil Sezgin',
      title: 'Full-Stack Developer',
      bio: 'Building end-to-end web applications and high-performance automation platforms.',
      about: 'I specialize in building end-to-end web applications, real-time automation systems, and scalable REST APIs.\nCurrently crafting web applications and services at Jetconnect. I focus on event-driven architectures, workflow automation (n8n, Apify), and modern backends with Node.js and TypeScript.\nI am also building and optimizing wBox.me, a high-performance WhatsApp SaaS and API automation platform, bringing real-time messaging and bot automation to businesses.',
      location: 'Istanbul, Turkey',
      email: 'ibrahimhalilsezgin@proton.me',
      githubUrl: 'https://github.com/ibrahimhalilsezgin',
      linkedinUrl: 'https://linkedin.com/in/ibrahimhalilsezgin',
      githubUsername: 'ibrahimhalilsezgin'
    });
  }

  // 2. Experience
  const expCount = await Experience.countDocuments();
  if (expCount === 0) {
    await Experience.create([
      {
        year: '2024 - Present',
        role: 'Full-Stack Developer',
        company: 'Jetconnect',
        description: 'Building web applications and services. Event-driven architectures, workflow automation (n8n, Apify), modern backends with Node.js and TypeScript.',
        order: 1
      },
      {
        year: '2023 - Present',
        role: 'Founder & Developer',
        company: 'wBox.me',
        description: 'Building and optimizing a high-performance WhatsApp SaaS and API automation platform. Real-time messaging, bot automation, WebSocket architecture.',
        order: 2
      },
      {
        year: '2022 - 2023',
        role: 'Freelance Developer',
        company: 'Self-employed',
        description: 'Web development projects, REST API design, and automation solutions for various clients. Built hurgazete.com news platform.',
        order: 3
      }
    ]);
  }

  // 3. Projects
  const projCount = await Project.countDocuments();
  if (projCount === 0) {
    await Project.create([
      {
        title: 'wBox.me',
        description: 'Real-time messaging, bot automation, and API integration service built with Node.js, WebSockets, and MongoDB.',
        imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_cdf35ec07b_4fd36ef45195ee85.png',
        projectUrl: 'https://wbox.me',
        categories: ['saas', 'api'],
        featuredText: 'Featured SaaS',
        order: 1
      },
      {
        title: 'hurgazete.com',
        description: 'A modern and scalable digital news portal providing regional news coverage with an emphasis on speed and performance.',
        imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_23027e7cd8_52979f469f7181c1.png',
        projectUrl: 'https://hurgazete.com',
        categories: ['web'],
        featuredText: 'News Platform',
        order: 2
      }
    ]);
  }
}
