import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a signed URL for a private storage file
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns The signed URL or null if generation fails
 */
export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    return null;
  }
};

/**
 * Generate signed URLs for multiple files
 * @param bucket - The storage bucket name
 * @param paths - Array of file paths within the bucket
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Array of signed URLs in the same order as paths
 */
export const getSignedUrls = async (
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<(string | null)[]> => {
  return Promise.all(
    paths.map(path => getSignedUrl(bucket, path, expiresIn))
  );
};

/**
 * Extract file path from a full storage URL
 * @param url - The full storage URL
 * @param bucket - The bucket name to extract path from
 * @returns The file path within the bucket
 */
export const extractPathFromUrl = (url: string, bucket: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/${bucket}/`);
    return pathParts.length > 1 ? pathParts[1] : url;
  } catch {
    // If URL parsing fails, assume it's already a path
    return url;
  }
};

/**
 * Get a signed URL from a manufacturing-estimates storage URL
 * Converts public URLs or paths to signed URLs for private access
 * @param imageUrl - The image URL or path
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns The signed URL or the original URL if conversion fails
 */
export const getEstimateImageSignedUrl = async (
  imageUrl: string,
  expiresIn: number = 3600
): Promise<string> => {
  if (!imageUrl) return imageUrl;
  
  const path = extractPathFromUrl(imageUrl, 'manufacturing-estimates');
  const signedUrl = await getSignedUrl('manufacturing-estimates', path, expiresIn);
  
  return signedUrl || imageUrl;
};

/**
 * Upload file to manufacturing-estimates bucket with proper user folder structure
 * @param file - The file to upload
 * @param userId - The user's ID for folder organization
 * @returns The file path in storage (not signed URL)
 */
export const uploadEstimateImage = async (
  file: File,
  userId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const filePath = `${userId}/${timestamp}_${randomString}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('manufacturing-estimates')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return data.path;
};
