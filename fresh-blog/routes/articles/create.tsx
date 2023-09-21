import Header from "../../islands/Header.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { createArticle } from "../../util/db.tsx";

interface Data {
  error: {
    title: string;
    content: string;
  };
  title?: string;
  content?: string;
}

export const handler: Handlers<Data> = {
  GET(_req, ctx) {
    return ctx.render();
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();

    if (!title || !content) {
      return ctx.render({
        error: {
          title: title ? "" : "title is required",
          content: content ? "" : "content is required",
        },
        title,
        content,
      });
    }

    await createArticle(title, content);

    return new Response("", {
      status: 303,
      headers: {
        Location: "/articles",
      },
    });
  },
};

export default function Create(props: PageProps<Data | undefined>) {
  return (
    <>
      <Header isLogin={true} />
      <div class="px-4 py-8 mx-auto bg-gray-100">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-left w-full font-bold text-5xl py-8">Create Post</h1>
          <form
            class="rounded-xl border p-5 shadow-md bg-white mt-8 w-full"
            method="POST"
          >
            <h3 class="font-bold mt-4 mb-2">Title</h3>
            <input
              id="title"
              class="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              name="title"
              value={props.data?.title}
            />
            {props.data?.error?.title && (
              <p class="text-red-500 text-sm">{props.data.error.title}</p>
            )}
            <h3 class="font-bold mt-4 mb-2">Content</h3>
            <textarea
              id="content"
              class="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              name="content"
              rows={10}
              value={props.data?.content}
            />
            {props.data?.error?.content && (
              <p class="text-red-500 text-sm">{props.data.error.content}</p>
            )}
            <button
              type="submit"
              class="rounded-lg border border-blue-500 bg-blue-500 mt-4 px-5 py-2 text-center text-sm font-bold text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
            >
              Create
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
