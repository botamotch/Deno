import {
  deleteCookie,
  getCookies,
} from "https://deno.land/std@0.201.0/http/cookie.ts";
import { Handlers } from "$fresh/server.ts";
import { SignOut } from "../../util/auth.tsx";

export const handler: Handlers = {
  GET(req, _ctx) {
    console.log("### logout");
    const cookies = getCookies(req.headers);
    // SignOut(cookies["access_token"]);
    // deleteCookie(req.headers, "access_token");
    // deleteCookie(req.headers, "refresh_token");
    // console.log(req.headers.get("set-cookie"));

    const res = new Response("", {
      status: 302,
      headers: {
        Location: "/",
      },
    });

    deleteCookie(res.headers, "access_token", { path: "/" });
    deleteCookie(res.headers, "refresh_token", { path: "/" });
    // console.log(res.headers.get("set-cookie"));
    // res.headers.set("set-cookie", "access_token=");

    return res;
  },
};

export default function Logout() {
  return <></>;
}
