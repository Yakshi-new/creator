import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'creator-assets';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    try {
        console.log('Testing Supabase connection...');
        console.log('SUPABASE_URL:', supabaseUrl);
        
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
            throw error;
        }
        
        console.log('Supabase connected successfully!');
        console.log('Available buckets:', data.map(b => b.name));
        
        const bucketExists = data.some(b => b.name === supabaseBucket);
        console.log(`Bucket "${supabaseBucket}" exists:`, bucketExists);
        
    } catch (error) {
        console.error('Supabase connection failed:', error);
    }
}

testSupabase();
