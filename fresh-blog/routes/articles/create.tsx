import Header from "../../islands/Header.tsx";
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
};

export default function Create() {
  return (
    <>
      <Header />
      <div class="px-4 py-8 mx-auto bg-gray-100">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-left w-full font-bold text-5xl py-8">Create Post</h1>
          <a
            href="/articles/create"
            type="button"
            class="rounded-lg border border-blue-500 bg-blue-500 px-5 py-2 text-center text-sm font-bold text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
          >
            Create
          </a>
          <form
            class="rounded-xl border p-5 shadow-md bg-white mt-8 w-full"
            method="POST"
          >
            <h3>Title</h3>
            <input
              class="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              name="title"
            />
            <h3>Content</h3>
            <textarea
              class="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              name="content"
              rows={10}
            />
          </form>
        </div>
      </div>
    </>
  );
}
