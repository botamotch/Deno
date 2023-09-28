import { setCookie } from "$std/http/cookie.ts";
import type { RouterContext as X } from "$oak/router.ts";
// deno-lint-ignore no-explicit-any
type RouterContext = X<any, any, any>;

export function TestGetFunc(ctx: RouterContext) {
  ctx.response.body = `hello world from oak roter, from ${ctx.request.method}\n`;
  ctx.response.body += `secure : ${ctx.request.secure}`;
}

export async function TestPostFunc(ctx: RouterContext) {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    if (body["name"]) {
      // console.log("name : " + body["name"]);
      ctx.response.body = `hello world from oak roter, ${body["name"]} from ${ctx.request.method}`;
    }
  } catch (_) {
    ctx.response.body = `hello world from oak roter, from ${ctx.request.method}`;
  }
}

export function TestCookieFunc(ctx: RouterContext) {
  ctx.response.body = "hello world from oak roter!, /api";
  ctx.cookies.set("TimeStamp", Date.now().toString());
  setCookie(ctx.response.headers, { name: "name1", value: "value1" });
  setCookie(ctx.response.headers, { name: "name2", value: "value2" });
  ctx.cookies.set("name3", "value3");
  ctx.cookies.set("name4", "value4");
  // ctx.response.headers.append("Set-Cookie", "name1=value1");
  // ctx.response.headers.append("Set-Cookie", "name2=value2");
  // console.log(ctx.response.headers);
}

export async function TestGithubFunc(ctx: RouterContext) {
  const res = await fetch("https://api.github.com/users/denoland", {
    headers: {
      accept: "application/json",
    },
  });
  ctx.response.body = res.body;
  ctx.response.headers.set("content-type", "application/json");
}
