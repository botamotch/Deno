import Header from "../islands/Header.tsx";
import { Article, findAllArticles } from "../util/db.tsx";
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
          <h3 class="text-left w-full font-bold text-2xl py-4">posts</h3>
          {props.data.map((a) => (
            <div class="bg-white rounded-lg my-4 p-4 w-full">
              <h3 class="font-bold">
                <a href={"/articles/" + a.id}>{a.title}</a>
              </h3>
              <p>
                {a.created_at}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
