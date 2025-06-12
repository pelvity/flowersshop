import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create an S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'flowershop-r2';
const r2PublicUrl = 'https://942bcfdd09a12d8ce5ad15cc5b8b1c10.r2.cloudflarestorage.com';

/**
 * Uploads a file to R2 storage
 * @param file - The file to upload
 * @param path - The path/key where the file will be stored
 * @returns The URL of the uploaded file
 */
export async function uploadToR2(file: File | Blob, path: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: path,
    Body: buffer,
    ContentType: file.type,
  });
  
  await r2Client.send(command);
  
  // Return the URL for accessing the file using the consistent format
  return `${r2PublicUrl}/${bucketName}/${path}`;
}

/**
 * Generates a presigned URL for a file in R2 storage
 * @param path - The path/key of the file
 * @param expiresIn - The time in seconds until the URL expires (default: 3600 seconds = 1 hour)
 * @returns The presigned URL
 */
export async function getPresignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: path,
  });
  
  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Deletes a file from R2 storage
 * @param path - The path/key of the file to delete
 */
export async function deleteFromR2(path: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: path,
  });
  
  await r2Client.send(command);
}

/**
 * Generates a public URL for accessing a file
 * For this to work, the bucket must be configured as public
 * @param path - The path/key of the file
 * @returns The public URL of the file
 */
export function getPublicUrl(path: string): string {
  return `${r2PublicUrl}/${bucketName}/${path}`;
} 