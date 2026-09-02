import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { encrypt, decrypt } from '@/lib/crypto';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_session')?.value === 'true';
}

export async function GET() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    let settings = await Settings.findOne({ isSingleton: true });
    
    if (!settings) {
      settings = await Settings.create({ isSingleton: true });
    }

    // Only return the first few characters of the API key for security
    let maskedKey = '';
    if (settings.openaiApiKey) {
      const decrypted = decrypt(settings.openaiApiKey);
      if (decrypted) {
        maskedKey = decrypted.substring(0, 7) + '...' + decrypted.substring(decrypted.length - 4);
      }
    }

    return NextResponse.json({
      openaiModel: settings.openaiModel,
      hasApiKey: !!settings.openaiApiKey,
      maskedApiKey: maskedKey
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    await dbConnect();

    const updateData: any = {};
    
    if (data.openaiModel) {
      updateData.openaiModel = data.openaiModel;
    }
    
    // Only update API key if a new one is provided
    if (data.openaiApiKey && !data.openaiApiKey.includes('...')) {
      updateData.openaiApiKey = encrypt(data.openaiApiKey);
    }

    const settings = await Settings.findOneAndUpdate(
      { isSingleton: true },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
