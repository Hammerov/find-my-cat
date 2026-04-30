import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

// Keep app booting even when env vars are missing, then show friendly UI errors.
const safeUrl = supabaseUrl || "https://example.supabase.co";
const safeAnonKey = supabaseAnonKey || "missing-anon-key";

export const supabase = createClient(safeUrl, safeAnonKey);
