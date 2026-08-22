import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';

export async function POST(req: Request) {
  await dbConnect();
  const { password } = await req.json();

  const admin = await Admin.findOne({ username: 'admin' });
  if (!admin) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
