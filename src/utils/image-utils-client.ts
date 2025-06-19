'use client';

import { getFileUrl } from "@/utils/cloudflare-worker";

// Client-side utility
export const getValidImageUrlClient = (mediaItem: any) => {
  if (!mediaItem) return "/placeholder-image.jpg";
  if (mediaItem.file_url) return mediaItem.file_url;
  if (mediaItem.file_path) return getFileUrl(mediaItem.file_path);
  return "/placeholder-image.jpg";
}; 