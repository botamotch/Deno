import { getCookies } from "$std/http/cookie.ts";
import { SetSession, SignInWithPassword } from "@/src/lib/supabase.ts";
import type { RouterContext as X } from "$oak/router.ts";
// deno-lint-ignore no-explicit-any
type RouterContext = X<any, any, any>;

export async function SignIn(ctx: RouterContext) {
  const res = await SignInWithPassword();
  // console.log(res);
  if (res && res.data.session) {
    const access_token = res.data.session.access_token;
    const refresh_token = res.data.session.refresh_token;
    ctx.response.headers.append(
      "Set-Cookie",
      `refresh_token=${refresh_token};`,
    );
    ctx.response.headers.append(
      "Set-Cookie",
      `access_token=${access_token};`,
    );
    // ctx.response.headers.set("Set-Cookie", `refresh_token=${refresh_token}; access_token=${access_token};`);
  }
}

export async function SetSettion(ctx: RouterContext) {
  const cookies = getCookies(ctx.request.headers);
  if (cookies["access_token"] && cookies["refresh_token"]) {
    const res = await SetSession(
      cookies["access_token"],
      cookies["refresh_token"],
    );
    if (res.data.user) {
      ctx.response.body = `user id is ${res.data.user.id}`;
      if (res.data.session) {
        const access_token = res.data.session.access_token;
        const refresh_token = res.data.session.refresh_token;
        ctx.response.headers.append(
          "Set-Cookie",
          `access_token=${access_token};`,
        );
        ctx.response.headers.append(
          "Set-Cookie",
          `refresh_token=${refresh_token};`,
        );
      }
    }

    if (res.error) {
      ctx.response.body = `set session error: ${res.error}`;
    }
  } else {
    ctx.response.body = `set session error: access_token, refresh_token is required`;
  }
}
