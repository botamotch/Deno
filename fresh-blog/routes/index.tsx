import Header from "../islands/Header.tsx";
import { findAllArticles } from "../util/db.tsx";

export default async function Home() {
  const titles: preact.JSX.Element[] = [];

  (await findAllArticles()).forEach((a) => {
    titles.push(
      <div class="bg-white rounded-lg my-4 p-4 w-full">
        <h3 class="font-bold">
          <a href={"/articles/" + a.id}>{a.title}</a>
        </h3>
        <p>
          {a.created_at}
        </p>
      </div>,
    );
  });

  return (
    <>
      <Header />
      <div class="px-4 py-8 mx-auto bg-gray-100">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-left w-full font-bold text-5xl py-8">Fresh blog</h1>
          <h3 class="text-left w-full font-bold text-2xl py-4">posts</h3>
          {titles}
        </div>
      </div>
    </>
  );
}
