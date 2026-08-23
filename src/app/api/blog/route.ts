import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
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
    const includeUnpublished = searchParams.get('all') === 'true';
    
    // Check auth if asking for unpublished posts
    if (includeUnpublished) {
        const isAuth = await isAuthenticated();
        if (!isAuth) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const query = includeUnpublished ? {} : { published: true };
    const posts = await BlogPost.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    // Create a simple slug if not provided
    if (!data.slug && data.title) {
        data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const newPost = await BlogPost.create(data);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}