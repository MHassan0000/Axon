import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client for server-side operations
 * Uses SERVICE_ROLE key to bypass RLS since we're using Clerk for auth
 * This should ONLY be used in server actions, never exposed to client
 */
export async function createClient() {
  // Use service role key for server-side operations with Clerk
  // This bypasses RLS since we handle auth with Clerk
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set!");
    throw new Error("Supabase service role key is required for server operations");
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
