import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { encrypt, decrypt } from '@/lib/crypto';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_session')?.value === 'true';
}

function maskKey(key: string | undefined | null) {
  if (!key) return '';
  const decrypted = decrypt(key);
  if (!decrypted) return '';
  return decrypted.substring(0, 7) + '...' + decrypted.substring(decrypted.length - 4);
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

    return NextResponse.json({
      activeProvider: settings.activeProvider || 'openai',
      openaiModel: settings.openaiModel || 'gpt-4o-mini',
      hasOpenaiApiKey: !!settings.openaiApiKey,
      maskedOpenaiApiKey: maskKey(settings.openaiApiKey),
      geminiModel: settings.geminiModel || 'gemini-2.5-flash',
      hasGeminiApiKey: !!settings.geminiApiKey,
      maskedGeminiApiKey: maskKey(settings.geminiApiKey),
      nvidiaModel: settings.nvidiaModel || 'meta/llama-3.1-70b-instruct',
      hasNvidiaApiKey: !!settings.nvidiaApiKey,
      maskedNvidiaApiKey: maskKey(settings.nvidiaApiKey),
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
    
    if (data.activeProvider) updateData.activeProvider = data.activeProvider;
    if (data.openaiModel) updateData.openaiModel = data.openaiModel;
    if (data.geminiModel) updateData.geminiModel = data.geminiModel;
    if (data.nvidiaModel) updateData.nvidiaModel = data.nvidiaModel;
    
    // Only update API keys if a new one is provided (doesn't contain ...)
    if (data.openaiApiKey && !data.openaiApiKey.includes('...')) {
      updateData.openaiApiKey = encrypt(data.openaiApiKey);
    }
    if (data.geminiApiKey && !data.geminiApiKey.includes('...')) {
      updateData.geminiApiKey = encrypt(data.geminiApiKey);
    }
    if (data.nvidiaApiKey && !data.nvidiaApiKey.includes('...')) {
      updateData.nvidiaApiKey = encrypt(data.nvidiaApiKey);
    }

    await Settings.findOneAndUpdate(
      { isSingleton: true },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
