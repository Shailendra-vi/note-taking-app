import { NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });

  return NextResponse.json({ token, user: { id: user._id, email: user.email, name: user.name } });
}