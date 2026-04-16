import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'creator-assets';

const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadToSupabase = async (file: Express.Multer.File, folder: string): Promise<string> => {
    if (!file) {
        throw new Error('No file provided');
    }

    const fileName = `${folder}/${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    
    const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(supabaseBucket)
        .getPublicUrl(fileName);

    return publicUrl;
};

export const deleteFromSupabase = async (url: string): Promise<void> => {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[folder]/[filename]
        // bucket is at index 5, rest is the path
        const filePath = pathParts.slice(6).join('/');
        
        const { error } = await supabase.storage
            .from(supabaseBucket)
            .remove([filePath]);

        if (error) throw error;
    } catch (error) {
        console.error('Supabase delete error:', error);
    }
};

// Map original function names to new Supabase functions for compatibility if needed
export const uploadToFirebase = uploadToSupabase;
export const deleteFromFirebase = deleteFromSupabase;
