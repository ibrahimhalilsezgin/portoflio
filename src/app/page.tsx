import dbConnect from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import Profile from '@/models/Profile';
import Experience from '@/models/Experience';
import Project from '@/models/Project';
import ClientPage from './ClientPage';

export const revalidate = 0; // Disable cache for dev

export default async function Page() {
  await dbConnect();
  await seedDatabase();

  const profile = await Profile.findOne({});
  const experiences = await Experience.find({}).sort({ order: 1, createdAt: -1 });
  const projects = await Project.find({}).sort({ order: 1, createdAt: -1 });

  return (
    <ClientPage 
      profile={JSON.parse(JSON.stringify(profile))} 
      experiences={JSON.parse(JSON.stringify(experiences))} 
      projects={JSON.parse(JSON.stringify(projects))} 
    />
  );
}