import Header from "../../islands/Header.tsx";
import { Article, findAllArticles } from "../../util/db.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers<Article[]> = {
  async GET(_req, ctx) {
    const articles = await findAllArticles();

    return ctx.render(articles);
  },
};

export default function Home(props: PageProps<Article[]>) {
  return (
    <>
      <Header />
      <div class="px-4 py-8 mx-auto bg-gray-100">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-left w-full font-bold text-5xl py-8">Fresh blog</h1>
          <div class="flex justify-between items-center w-full">
            <h3 class="text-left font-bold text-3xl">posts</h3>
            <a
              href="/articles/create"
              type="button"
              class="rounded-lg border border-blue-500 bg-blue-500 px-5 py-2 text-center text-sm font-bold text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300"
            >
              Create Post
            </a>
          </div>
          {props.data.map((a) => (
            <div class="bg-white rounded-lg my-4 p-4 w-full">
              <h3 class="font-bold">
                <a href={"/articles/" + a.id}>{a.title}</a>
              </h3>
              <p class="text-gray-500">
                {a.created_at.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
