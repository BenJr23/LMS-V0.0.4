'use server';

import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// path should be like 'subject-icons/filename.png' relative to the lms bucket
export async function getImageUrl(path: string) {
  try {
    if (!path) {
      console.log('No path provided to getImageUrl');
      return null;
    }

    console.log('Getting image URL for path:', path);

    // Get public URL from Supabase Storage
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('lms')
      .getPublicUrl(path);

    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
}

export async function uploadIcon(file: File) {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `subject-icons/${fileName}`;

    console.log('Attempting to upload file:', {
      path: filePath,
      type: file.type,
      size: file.size
    });

    // Upload to Supabase Storage using admin client
    const { error: uploadError } = await supabaseAdmin.storage
      .from('lms')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('Upload successful, file path:', filePath);

    return { 
      success: true, 
      path: filePath 
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to upload file' 
    };
  }
} 