import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Experience from '@/models/Experience';

export async function GET() {
  await dbConnect();
  const exps = await Experience.find({}).sort({ order: 1, createdAt: -1 });
  return NextResponse.json(exps);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const newExp = await Experience.create(body);
  return NextResponse.json(newExp);
}
