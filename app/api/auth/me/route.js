import { NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await protect(req);
    
    return NextResponse.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email
    }});
  } catch (error) {
    console.log("Error: ", error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}