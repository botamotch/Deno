import Header from "../islands/Header.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { CheckSession, SignInWithPassword } from "../util/auth.tsx";
import { setCookie } from "https://deno.land/std@0.201.0/http/cookie.ts";

interface LoginData {
  error: {
    email: string;
    password: string;
  };
  email?: string;
  password?: string;
}

export const handler: Handlers<LoginData> = {
  async GET(req, ctx) {
    const session = await CheckSession(req);
    if (session instanceof Response) {
      return ctx.render();
    } else {
      const res = new Response("", {
        status: 302,
        headers: {
          Location: "/articles",
        },
      });
      setCookie(res.headers, {
        name: "access_token",
        value: session.access_token,
      });
      setCookie(res.headers, {
        name: "refresh_token",
        value: session.refresh_token,
      });

      return res;
    }
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

    if (error == null) {
      const res = new Response("", {
        status: 302,
        headers: {
          Location: "/articles",
        },
      });

      setCookie(res.headers, {
        name: "access_token",
        value: data.session.access_token,
      });
      setCookie(res.headers, {
        name: "refresh_token",
        value: data.session.refresh_token,
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
      <Header />
      <div class="px-4 py-8 mx-auto bg-gray-100">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-left w-full font-bold text-5xl py-8">Fresh blog</h1>
          <form method="POST">
            <h3 class="font-bold mt-4 mb-2">Email</h3>
            <input
              id="email"
              class="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              name="email"
            />
            <h3 class="font-bold mt-4 mb-2">Password</h3>
            <input
              id="password"
              class="w-full p-2 border border-gray-300 rounded-md"
              type="password"
              name="password"
            />
            <button
              type="submit"
              class="rounded-lg border border-blue-500 bg-blue-500 mt-4 px-5 py-2 text-center text-sm font-bold text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
