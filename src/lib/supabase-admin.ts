/**
 * SERVER-ONLY SUPABASE ADMIN CLIENT
 * 
 * WARNING: Never import this file into any Client Component or any code path
 * that could be bundled for the browser. The SUPABASE_SERVICE_ROLE_KEY bypasses
 * all Row Level Security (RLS) policies and grants full admin access to your
 * Supabase instance.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
