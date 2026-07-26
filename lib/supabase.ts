import { createClient } from "@supabase/supabase-js";

// Fallback values keep `next build` independent of local secrets. Real project
// reads require the two NEXT_PUBLIC_SUPABASE_* variables documented in .env.example.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_project_url"
  ? "https://placeholder.supabase.co" : process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "your_supabase_anon_key"
  ? "placeholder-anon-key" : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) }
});
