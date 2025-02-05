// app/api/upload/audio/route.js
import { NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await protect(req);
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'audio',
    });

    const uploadStream = gridFSBucket.openUploadStream(audioFile.name, {
      metadata: { userId: user._id },
    });

    const buffer = await audioFile.arrayBuffer();
    await uploadStream.write(Buffer.from(buffer));
    await uploadStream.end();

    return NextResponse.json({ fileId: uploadStream.id.toString() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}