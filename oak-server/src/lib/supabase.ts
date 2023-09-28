import { load } from "$std/dotenv/mod.ts";
import { createClient, SupabaseClient } from "$supabase-js";

await load({ export: true });

const supabaseKey = Deno.env.get("SUPABASE_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseUsername = Deno.env.get("SUPABASE_USERNAME");
const supabasePassword = Deno.env.get("SUPABASE_PASSWORD");

let supabase: SupabaseClient;

function init() {
  supabase = createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function SignInWithPassword() {
  init();
  if (supabaseUsername && supabasePassword) {
    return await supabase.auth.signInWithPassword({
      email: supabaseUsername,
      password: supabasePassword,
    });
  }
}

export async function SetSession(access_token: string, refresh_token: string) {
  init();
  return await supabase.auth.setSession({
    access_token: access_token,
    refresh_token: refresh_token,
  });
}

export async function GetUser(access_token: string) {
  init();
  return await supabase.auth.getUser(access_token);
}
