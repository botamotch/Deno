import { Handlers, PageProps } from "$fresh/server.ts";
import Header from "../../islands/Header.tsx";
import { Article, findArticleById } from "../../util/db.tsx";

export const handler: Handlers<Article | null> = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const article = await findArticleById(id);
    if (!article) {
      return ctx.render(null);
    }
    return ctx.render(article);
  },
};

export default function Page({ data }: PageProps<Article | null>) {
  if (!data) {
    return <div>Not Found</div>;
  }

  return (
    <>
      <Header />
      <div class="px-4 py-8 mx-auto bg-gray-100">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="mt-10 text-2xl font-bold">
            {data.title}
          </h1>
          <p class="mt-4 mb-10 text-gray-500">
            created at
          </p>

          <div class="bg-white w-full px-10 py-10 rounded-lg">
            {data.content}
          </div>
        </div>
      </div>
    </>
  );
}
