import {
  deleteCookie,
  getCookies,
} from "https://deno.land/std@0.201.0/http/cookie.ts";
import { Handlers } from "$fresh/server.ts";
import { SignOut } from "../util/auth.tsx";

export const handler: Handlers = {
  GET(_req, _ctx) {
    // const cookies = getCookies(req.headers);
    // const access_token = cookies["access_token"] == undefined
    //   ? ""
    //   : cookies["access_token"];
    // SignOut(access_token);

    const res = new Response("", {
      status: 302,
      headers: {
        Location: "/",
      },
    });

    deleteCookie(res.headers, "access_token");
    deleteCookie(res.headers, "refresh_token");

    return res;
  },
};

export default function Logout() {
  return <></>;
}
