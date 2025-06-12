import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Create an S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'flowershop-r2';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    const entityId = formData.get('entityId') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const uuid = uuidv4().slice(0, 8);
    const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
    const path = `${folder}/${entityId ? entityId + '/' : ''}${timestamp}-${uuid}-${safeName}`;

    // Get file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      Body: buffer,
      ContentType: file.type,
    });

    await r2Client.send(command);

    // Use the consistent Cloudflare R2 URL format
    const fileUrl = `https://942bcfdd09a12d8ce5ad15cc5b8b1c10.r2.cloudflarestorage.com/${bucketName}/${path}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      path: path,
      name: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
