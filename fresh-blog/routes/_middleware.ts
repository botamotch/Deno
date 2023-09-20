import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { CheckSession } from "../util/auth.tsx";
import {
  getCookies,
  setCookie,
} from "https://deno.land/std@0.201.0/http/cookie.ts";

interface State {
  isLogin: boolean;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const cookies = getCookies(req.headers);
  const access_token = cookies["access_token"];
  const refresh_token = cookies["refresh_token"];

  if (ctx.destination == "route") {
    const session = await CheckSession(access_token, refresh_token);
    ctx.state.isLogin = session.is_login;
    const res = await ctx.next();
    if (session.is_login) {
      setCookie(res.headers, {
        name: "access_token",
        value: session.access_token!,
        path: "/",
      });
      setCookie(res.headers, {
        name: "refresh_token",
        value: session.refresh_token!,
        path: "/",
      });
    } else {
      // deleteCookie(res.headers, "access_token");
      // deleteCookie(res.headers, "refresh_token");
    }
    return res;
  }
  return await ctx.next();
}
