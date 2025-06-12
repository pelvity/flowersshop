import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ReadableStream } from 'stream/web';
import { Readable } from 'stream';

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
 * Uploads a buffer to R2 storage
 * @param buffer - The buffer to upload
 * @param path - The path/key where the file will be stored
 * @param contentType - The content type of the file
 * @returns The URL of the uploaded file
 */
export async function uploadBufferToR2(buffer: Buffer, path: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: path,
    Body: buffer,
    ContentType: contentType,
  });
  
  await r2Client.send(command);
  
  // Return the URL for accessing the file using the consistent format
  return `${r2PublicUrl}/${bucketName}/${path}`;
}

/**
 * Uploads a ReadableStream to R2 storage
 * @param stream - The readable stream to upload
 * @param path - The path/key where the file will be stored
 * @param contentType - The content type of the file
 * @returns The URL of the uploaded file
 */
export async function uploadStreamToR2(stream: ReadableStream, path: string, contentType: string): Promise<string> {
  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  
  let result;
  do {
    result = await reader.read();
    if (!result.done) {
      chunks.push(result.value);
    }
  } while (!result.done);
  
  const buffer = Buffer.concat(chunks);
  
  return uploadBufferToR2(buffer, path, contentType);
}

/**
 * Helper function to convert a stream to a buffer
 */
async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    // Handle both Node.js Readable streams and web ReadableStreams
    if (stream instanceof Readable) {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    } else if (stream && typeof stream.transformToByteArray === 'function') {
      // For AWS SDK's Blob-like stream
      stream.transformToByteArray().then((byteArray: Uint8Array) => {
        resolve(Buffer.from(byteArray));
      }).catch(reject);
    } else {
      reject(new Error('Unsupported stream type'));
    }
  });
}

/**
 * Downloads a file from R2 storage
 * @param path - The path/key of the file to download
 * @returns The file buffer and content type
 */
export async function downloadFromR2(path: string): Promise<{ buffer: Buffer, contentType: string }> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: path,
  });
  
  const response = await r2Client.send(command);
  const body = response.Body;
  
  if (!body) {
    throw new Error('File not found');
  }
  
  try {
    const buffer = await streamToBuffer(body);
    return {
      buffer,
      contentType: response.ContentType || 'application/octet-stream',
    };
  } catch (error) {
    console.error('Error converting stream to buffer:', error);
    throw new Error('Failed to process the file');
  }
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
 * Lists objects in a folder in R2 storage
 * @param prefix - The folder path/prefix
 * @param maxKeys - The maximum number of keys to return
 * @returns The list of objects
 */
export async function listObjects(prefix: string, maxKeys = 1000) {
  const command = new ListObjectsCommand({
    Bucket: bucketName,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });
  
  const response = await r2Client.send(command);
  return response.Contents || [];
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