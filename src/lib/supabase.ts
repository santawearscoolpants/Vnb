import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Auth features will not work.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
