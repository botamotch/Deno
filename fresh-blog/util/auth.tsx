import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.33.2";

export interface Session {
  is_login: boolean;
  access_token?: string;
  refresh_token?: string;
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
  // 1. getUser
  const resGetUser = await supabase.auth.getUser(access_token);
  if (!resGetUser.error) {
    console.log("### getUser Success");
    console.log(`refresh_token : ${refresh_token}`);
    console.log(`access_token : ${access_token}`);
    return {
      is_login: true,
      refresh_token: refresh_token,
      access_token: access_token,
    };
  }

  // 2. refreshSession
  const resRefreshSession = await supabase.auth.refreshSession({
    refresh_token: refresh_token,
  });
  if (!resRefreshSession.error) {
    console.log("### refreshSession Success");
    console.log(
      `refresh_token : ${resRefreshSession.data.session!.refresh_token}`,
    );
    console.log(
      `access_token : ${resRefreshSession.data.session!.access_token}`,
    );
    return {
      is_login: true,
      refresh_token: resRefreshSession.data.session!.refresh_token,
      access_token: resRefreshSession.data.session!.access_token,
    };
  }

  // 3. error, redirect to top
  console.log(
    `### getUser Failed, [${resRefreshSession.error.status} ${resRefreshSession.error.name}] ${resRefreshSession.error.message}`,
  );
  console.log(`access_token : ${access_token}`);

  return { is_login: false };
}
