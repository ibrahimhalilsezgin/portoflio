import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Experience from '@/models/Experience';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const body = await req.json();
  const { id } = await params;
  const updated = await Experience.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  await Experience.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
