/**
 * Utility functions for interacting with the Cloudflare Worker
 */

/**
 * Builds the appropriate URL for worker interactions
 * @param path - Optional path segment to append to the worker URL
 * @returns The full URL to use for worker requests
 */
export function getWorkerUrl(path?: string): string {
  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
  
  if (!path) {
    return workerUrl || '/api/r2-upload';
  }

  // Ensure path doesn't start with a slash if we're appending
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Use direct worker URL if available, otherwise use API proxy
  if (workerUrl) {
    return `${workerUrl}/${cleanPath}`;
  } else {
    return `/api/r2-upload/${cleanPath}`;
  }
}

/**
 * Uploads a file to R2 storage via the Cloudflare Worker
 * @param file - The file to upload
 * @param folder - The folder to store the file in
 * @param entityId - Optional entity ID to associate with the file
 * @returns The upload response with URL, path, etc.
 */
export async function uploadToWorker(
  file: File,
  folder: string = 'uploads',
  entityId?: string
): Promise<{
  success: boolean;
  url?: string;
  path?: string;
  name?: string;
  size?: number;
  type?: string;
  error?: string;
  code?: string;
  details?: any;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  if (entityId) {
    formData.append('entityId', entityId);
  }
  
  try {
    const response = await fetch(getWorkerUrl(), {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Worker upload failed:', data);
      return {
        success: false,
        error: data.error || 'Upload failed',
        code: data.code,
        details: data.details || data
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error during worker upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
      details: error
    };
  }
}

/**
 * Deletes a file from R2 storage via the Cloudflare Worker
 * @param filePath - The path/key of the file to delete
 * @returns The response indicating success or failure
 */
export async function deleteFromWorker(filePath: string): Promise<{
  success: boolean;
  message?: string;
  path?: string;
  error?: string;
  code?: string;
  details?: any;
}> {
  try {
    const response = await fetch(getWorkerUrl(filePath), {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Worker delete failed:', data);
      return {
        success: false,
        error: data.error || 'Delete failed',
        code: data.code,
        details: data.details || data
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error during worker delete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error',
      details: error
    };
  }
}

/**
 * Gets the full URL for a file path
 * @param filePath - The path of the file in R2 storage
 * @param width - Optional width for image resizing
 * @param height - Optional height for image resizing
 * @param quality - Optional quality (1-100) for image compression
 * @returns The full URL to access the file
 */
export function getFileUrl(
  filePath: string, 
  width?: number,
  height?: number,
  quality?: number
): string {
  let url = getWorkerUrl(filePath);
  
  // Add image resizing parameters if provided
  if (width || height || quality) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    
    url += `?${params.toString()}`;
  }
  
  return url;
} 