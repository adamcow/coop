import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Debugging check to see what Vite is actually loading
console.log('Supabase URL loaded:', supabaseUrl);
console.log('Supabase Key length:', supabaseAnonKey?.length);
console.log(
  'Supabase Key loaded (first 10 chars):',
  supabaseAnonKey ? supabaseAnonKey.substring(0, 10) : 'UNDEFINED OR NULL'
);
try {
  const payload = JSON.parse(atob(supabaseAnonKey.split('.')[1]));
  console.log('Key payload:', payload);
} catch (e) {
  console.log('Could not decode — not a JWT-format key');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
