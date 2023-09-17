import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const supabaseKey = Deno.env.get("SUPABASE_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export async function SignInWithPassword(email: string, password: string) {
  const res = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });
  return res;
}
