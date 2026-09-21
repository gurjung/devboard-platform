/**
 * SERVER-ONLY SUPABASE ADMIN CLIENT
 *
 * WARNING: Never import this file into any Client Component or any code path
 * that could be bundled for the browser. The SUPABASE_SERVICE_ROLE_KEY bypasses
 * all Row Level Security (RLS) policies and grants full admin access to your
 * Supabase instance.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  let supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).trim();

  // Strip wrapping quotes if accidentally entered in env vars
  if (
    (supabaseUrl.startsWith('"') && supabaseUrl.endsWith('"')) ||
    (supabaseUrl.startsWith("'") && supabaseUrl.endsWith("'"))
  ) {
    supabaseUrl = supabaseUrl.slice(1, -1).trim();
  }

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL: Please set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) in your environment variables."
    );
  }

  if (
    !supabaseUrl.startsWith("http://") &&
    !supabaseUrl.startsWith("https://")
  ) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}" is missing http:// or https://`
    );
  }

  let supabaseServiceRoleKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  ).trim();

  if (
    (supabaseServiceRoleKey.startsWith('"') &&
      supabaseServiceRoleKey.endsWith('"')) ||
    (supabaseServiceRoleKey.startsWith("'") &&
      supabaseServiceRoleKey.endsWith("'"))
  ) {
    supabaseServiceRoleKey = supabaseServiceRoleKey.slice(1, -1).trim();
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase Service Role Key: Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables."
    );
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
