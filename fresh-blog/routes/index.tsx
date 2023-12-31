import Header from "../islands/Header.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { SignInWithPassword } from "../util/auth.tsx";
import { setCookie } from "https://deno.land/std@0.201.0/http/cookie.ts";

interface LoginData {
  error: {
    email: string;
    password: string;
  };
  email?: string;
  password?: string;
}

export const handler: Handlers<LoginData, { isLogin: boolean }> = {
  async GET(_req, ctx) {
    console.log("isLogin : " + ctx.state.isLogin);
    if (ctx.state.isLogin) {
      return new Response("", {
        status: 302,
        headers: {
          Location: "/articles",
        },
      });
    }

    return await ctx.render();
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return ctx.render({
        error: {
          email: email ? "" : "email is required",
          password: password ? "" : "password is required",
        },
        email: email,
        password: password,
      });
    }

    const { data, error } = await SignInWithPassword(email, password);
    console.log("SignInWithPassword error : " + error);

    if (error == null) {
      const res = new Response("", {
        status: 302,
        headers: {
          Location: "/articles",
        },
      });
      console.log("refresh_token : " + data.session.refresh_token);
      console.log("access_token : " + data.session.access_token);

      setCookie(res.headers, {
        name: "access_token",
        value: data.session.access_token,
        path: "/",
      });
      setCookie(res.headers, {
        name: "refresh_token",
        value: data.session.refresh_token,
        path: "/",
      });

      return res;
    } else {
      return ctx.render({
        error: {
          email: "ユーザ認証に失敗しました",
          password: "ユーザ認証に失敗しました",
        },
        email: email,
        password: password,
      });
    }
  },
};

export default function Home(_props: PageProps<LoginData>) {
  return (
    <>
      <Header isLogin={false} />
      <div class="px-4 py-8 mx-auto bg-gray-100">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-left w-full font-bold text-5xl py-8">Fresh blog</h1>
        </div>
      </div>
    </>
  );
}
