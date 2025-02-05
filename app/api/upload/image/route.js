// app/api/upload/image/route.js
import { NextResponse } from 'next/server';
import { protect } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function POST(req) {
  try {
    await dbConnect();
    const user = await protect(req);
    const formData = await req.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images',
    });

    const uploadStream = gridFSBucket.openUploadStream(imageFile.name, {
      metadata: { userId: user._id },
    });

    const buffer = await imageFile.arrayBuffer();
    await uploadStream.write(Buffer.from(buffer));
    await uploadStream.end();

    return NextResponse.json({ fileId: uploadStream.id.toString() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}