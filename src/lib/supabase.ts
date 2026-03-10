import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase environment variables are missing. Auth features will not work.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your frontend env and restart the dev server.'
    );
  }
  return supabase;
}

export type AppUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export function mapSupabaseUser(user: any): AppUser {
  const metadata = user?.user_metadata || {};
  return {
    id: String(user?.id || ''),
    email: String(user?.email || ''),
    first_name: String(metadata.first_name || ''),
    last_name: String(metadata.last_name || ''),
  };
}
