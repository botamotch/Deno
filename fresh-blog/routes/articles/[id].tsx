import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import Header from "../../islands/Header.tsx";
import { Article, findArticleById } from "../../util/db.tsx";
import { CSS, render } from "https://deno.land/x/gfm@0.2.5/mod.ts";

export const handler: Handlers<Article | null> = {
  async GET(_req, ctx) {
    if (!ctx.state.isLogin) {
      return new Response("", {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const { id } = ctx.params;
    const article = await findArticleById(id);
    if (!article) {
      return ctx.render(null);
    }

    article.contentRenderd = render(article.content);

    return ctx.render(article);
  },
};

export default function Page({ data }: PageProps<Article | null>) {
  if (!data) {
    return <div>Not Found</div>;
  }

  return (
    <>
      <Head>
        <title>{data.title}</title>
        <link rel="stylesheet" href="/article.css" />
      </Head>
      <Header isLogin={true} />
      <div class="px-4 py-8 mx-auto bg-gray-100">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="mt-10 text-2xl font-bold">
            {data.title}
          </h1>
          <p class="mt-4 mb-10 text-gray-500">
            created at {data.created_at.toLocaleString()}
          </p>
          <div class="flex justify-end mb-4 w-full">
            <a
              href="/articles/create"
              type="button"
              class="rounded-lg border border-blue-500 bg-blue-500 px-5 py-2 text-center text-sm font-bold text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
            >
              Edit Post
            </a>
          </div>
          <div class="bg-white w-full px-10 py-10 rounded-lg">
            <div
              id="contents"
              dangerouslySetInnerHTML={{
                __html: data.contentRenderd ? data.contentRenderd : "",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
