import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import jwt from 'jsonwebtoken'

export async function POST(req) {
  await dbConnect();
  const { email, password, name } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const user = await User.create({ email, password, name });
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });

  return NextResponse.json({ token, user: { id: user._id, email: user.email, name: user.name } });
}