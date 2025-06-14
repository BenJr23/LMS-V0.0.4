'use server';

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type UploadResponse = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadFile(file: File, path: string): Promise<UploadResponse> {
  try {
    const { userId } = auth();
    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Generate a unique file name
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const fullPath = `${userId}/${path}/${uniqueFileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('lms')
      .upload(fullPath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lms')
      .getPublicUrl(fullPath);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}