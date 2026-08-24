import dbConnect from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import Profile from '@/models/Profile';
import Experience from '@/models/Experience';
import Project from '@/models/Project';
import Comment from '@/models/Comment';
import ClientPage from './ClientPage';

export const revalidate = 3600;

const fallbackProfile = {
  name: 'İbrahim Halil Sezgin',
  title: 'Full-Stack Developer',
  bio: 'Building end-to-end web applications and high-performance automation platforms.',
  about: 'I specialize in building end-to-end web applications, real-time automation systems, and scalable REST APIs.\nCurrently crafting web applications and services at Jetconnect. I focus on event-driven architectures, workflow automation (n8n, Apify), and modern backends with Node.js and TypeScript.\nI am also building and optimizing wBox.me, a high-performance WhatsApp SaaS and API automation platform, bringing real-time messaging and bot automation to businesses.',
  location: 'Istanbul, Turkey',
  email: 'ibrahimhalilsezgin@proton.me',
  githubUrl: 'https://github.com/ibrahimhalilsezgin',
  linkedinUrl: 'https://linkedin.com/in/ibrahimhalilsezgin',
  githubUsername: 'ibrahimhalilsezgin'
};

const fallbackExperiences = [
  {
    _id: '1',
    year: '2024 - Present',
    role: 'Full-Stack Developer',
    company: 'Jetconnect',
    description: 'Building web applications and services. Event-driven architectures, workflow automation (n8n, Apify), modern backends with Node.js and TypeScript.',
    order: 1
  }
];

const fallbackProjects = [
  {
    _id: '1',
    title: 'wBox.me',
    description: 'Real-time messaging, bot automation, and API integration service built with Node.js, WebSockets, and MongoDB.',
    imageUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_cdf35ec07b_4fd36ef45195ee85.png',
    projectUrl: 'https://wbox.me',
    categories: ['saas', 'api'],
    featuredText: 'Featured SaaS',
    order: 1
  }
];

export default async function Page() {
  let profile = fallbackProfile;
  let experiences = fallbackExperiences;
  let projects = fallbackProjects;
  let comments = [];

  try {
    if (process.env.MONGODB_URI) {
      await dbConnect();
      await seedDatabase();
      const dbProfile = await Profile.findOne({});
      const dbExperiences = await Experience.find({}).sort({ order: 1, createdAt: -1 });
      const dbProjects = await Project.find({}).sort({ order: 1, createdAt: -1 });
      const dbComments = await Comment.find({ approved: true }).sort({ createdAt: -1 });

      if (dbProfile) profile = JSON.parse(JSON.stringify(dbProfile));
      if (dbExperiences && dbExperiences.length > 0) experiences = JSON.parse(JSON.stringify(dbExperiences));
      if (dbProjects && dbProjects.length > 0) projects = JSON.parse(JSON.stringify(dbProjects));
      if (dbComments && dbComments.length > 0) comments = JSON.parse(JSON.stringify(dbComments));
    }
  } catch (err) {
    console.warn('MongoDB connection fallback:', err);
  }

  return (
    <ClientPage 
      profile={profile} 
      experiences={experiences} 
      projects={projects} 
      comments={comments}
    />
  );
}
