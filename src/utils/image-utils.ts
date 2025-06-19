// Server-side utility (doesn't use client-side functions)
export const getValidImageUrlServer = (mediaItem: any) => {
  if (!mediaItem) return "/placeholder-image.jpg";
  if (mediaItem.file_url) return mediaItem.file_url;
  if (mediaItem.file_path) return `/storage/${mediaItem.file_path}`;
  return "/placeholder-image.jpg";
}; 