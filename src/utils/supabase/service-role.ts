import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

let supabaseAdminClient: ReturnType<typeof createSupabaseClient<Database>>;

// Create a Supabase client with the service role key
export const createAdminClient = () => {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  // We should ideally get these from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // The service role key should be available in environment variables
  // WARNING: This should only be used in trusted server-side code
  // or in admin-only client-side code that has proper authentication checks
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase URL or service role key');
    // If we're missing the service role key, fall back to the regular client
    supabaseAdminClient = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    return supabaseAdminClient;
  }

  // Create a Supabase client with the service role key
  supabaseAdminClient = createSupabaseClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  return supabaseAdminClient;
}; 