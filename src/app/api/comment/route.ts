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

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const includeUnapproved = searchParams.get('all') === 'true';
    
    if (includeUnapproved) {
        if (!(await isAuthenticated())) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const query = includeUnapproved ? {} : { approved: true };
    const comments = await Comment.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Anyone can post a comment, but it defaults to approved: false
    const newComment = await Comment.create({
        name: data.name,
        role: data.role,
        content: data.content,
        approved: false // Always false on creation
    });
    
    return NextResponse.json({ message: 'Comment submitted successfully, awaiting approval.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
