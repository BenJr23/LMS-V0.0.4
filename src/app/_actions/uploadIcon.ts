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