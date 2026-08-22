import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';

export async function GET() {
  await dbConnect();
  const projects = await Project.find({}).sort({ order: 1, createdAt: -1 });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const project = await Project.create(body);
  return NextResponse.json(project);
}
