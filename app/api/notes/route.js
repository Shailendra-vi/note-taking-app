import { NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import Note from '@/models/Note';
import dbConnect from '@/lib/db';

export async function GET(req) {
  try {
    await dbConnect();
    const user = await protect(req);
    
    const notes = await Note.find({ user: user._id });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = await protect(req);
    const body = await req.json();

    const note = await Note.create({ ...body, user: user._id });
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
