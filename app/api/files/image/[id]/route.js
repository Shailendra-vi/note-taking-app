// app/api/files/image/[id]/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function GET(_, { params }) {
  await dbConnect();

  try {
    const gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images',
    });

    const fileId = new mongoose.Types.ObjectId(params.id);
    const downloadStream = gridFSBucket.openDownloadStream(fileId);

    return new Response(downloadStream, {
      headers: {
        'Content-Type': 'image/*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}