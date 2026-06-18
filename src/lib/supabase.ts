import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// During Vercel build, env vars are available — this guard prevents crashes
// if they are somehow missing (e.g. in CI preview without secrets).
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseKey || 'placeholder-anon-key';

export const supabase = createClient(url, key);

// Server-side utilities (for use in API routes)
export const createSupabaseClient = () => {
  return createClient(url, key);
};
