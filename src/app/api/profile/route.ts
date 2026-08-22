import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';

export async function GET() {
  await dbConnect();
  let profile = await Profile.findOne({});
  if (!profile) {
    profile = await Profile.create({
      name: 'Ibrahim Halil Sezgin',
      title: 'Full-Stack Developer',
      bio: 'Building modern web and SaaS apps.',
      about: 'I specialize in building end-to-end web applications, real-time automation systems, and scalable REST APIs.',
      location: 'Istanbul, Turkey',
      email: 'ibrahimhalilsezgin@proton.me',
      githubUrl: 'https://github.com/ibrahimhalilsezgin',
      linkedinUrl: 'https://linkedin.com/in/ibrahimhalilsezgin',
      githubUsername: 'ibrahimhalilsezgin'
    });
  }
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  await dbConnect();
  const body = await req.json();
  const profile = await Profile.findOneAndUpdate({}, body, { new: true, upsert: true });
  return NextResponse.json(profile);
}
