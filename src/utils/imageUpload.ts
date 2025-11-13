import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param userId - The user's ID (for organizing files)
 * @param productSku - Optional SKU for better organization
 * @returns The public URL of the uploaded image
 */
export const uploadProductImage = async (
  file: File,
  userId: string,
  productSku?: string
): Promise<string> => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, WEBP, or GIF image.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = productSku 
      ? `${userId}/${productSku}_${timestamp}_${randomString}.${fileExt}`
      : `${userId}/${timestamp}_${randomString}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full public URL of the image
 */
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/product-images/');
    if (pathParts.length < 2) {
      throw new Error('Invalid image URL');
    }
    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
};

/**
 * Convert a URL-based image to a File object for upload
 * @param imageUrl - The URL of the image
 * @param filename - Optional filename
 * @returns File object
 */
export const urlToFile = async (imageUrl: string, filename?: string): Promise<File> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const name = filename || `image_${Date.now()}.${blob.type.split('/')[1]}`;
    return new File([blob], name, { type: blob.type });
  } catch (error) {
    console.error('URL to file conversion error:', error);
    throw new Error('Failed to convert URL to file');
  }
};
