import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import { cookies } from 'next/headers';
import * as jose from 'jose';

// Helper for auth
async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_change_in_production');
    await jose.jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const data = await request.json();

    const updatedComment = await Comment.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
