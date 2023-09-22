import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.33.2";

export interface Session {
  is_login: boolean;
  access_token?: string;
  refresh_token?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  contentRenderd?: string;
  created_at: Date;
}

const supabaseKey = Deno.env.get("SUPABASE_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

let supabase: SupabaseClient;

function init() {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function SignInWithPassword(email: string, password: string) {
  init();
  const res = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });
  return res;
}

export async function SignOut(access_token: string) {
  init();
  await supabase.auth.admin.signOut(access_token);

  return;
}

export async function CheckSession(
  access_token: string,
  refresh_token: string,
): Promise<Session> {
  if (!access_token || !refresh_token) {
    return { is_login: false };
  }

  init();
  const resSetSession = await supabase.auth.setSession({
    access_token: access_token,
    refresh_token: refresh_token,
  });
  if (!resSetSession.error) {
    return {
      is_login: true,
      refresh_token: resSetSession.data.session?.refresh_token,
      access_token: resSetSession.data.session?.access_token,
    };
  }

  return { is_login: false };
}
