import {
  deleteCookie,
  getCookies,
} from "https://deno.land/std@0.201.0/http/cookie.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

export interface Session {
  access_token: string;
  refresh_token: string;
}

const supabaseKey = Deno.env.get("SUPABASE_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
supabase.auth.initialize();

export async function SignInWithPassword(email: string, password: string) {
  const res = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });
  return res;
}

export async function SignOut(access_token: string) {
  await supabase.auth.admin.signOut(access_token);
  // const res = await supabase.auth.signOut({})

  return;
}

export async function CheckSession(req: Request): Promise<Session | Response> {
  const cookies = getCookies(req.headers);
  const access_token = cookies["access_token"];
  const refresh_token = cookies["refresh_token"];

  if (refresh_token && access_token) {
    const res = await supabase.auth.setSession({
      refresh_token: refresh_token,
      access_token: access_token,
    });
  }

  const res = await supabase.auth.getUser(access_token);

  if (res.data.user != null) {
    const session: Session = {
      access_token: access_token,
      refresh_token: refresh_token,
    };

    return session;
  } else {
    const resRefresh = await supabase.auth.refreshSession({
      refresh_token: cookies["refresh_token"],
    });
    if (!resRefresh.error) {
      const session: Session = {
        refresh_token: resRefresh.data.session!.refresh_token,
        access_token: resRefresh.data.session!.access_token,
      };

      return session;
    }
  }

  const resError = new Response("", {
    status: 302,
    headers: {
      Location: "/",
    },
  });
  deleteCookie(resError.headers, "access_token");
  deleteCookie(resError.headers, "refresh_token");
  return resError;
}
