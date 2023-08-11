import { Head } from "$fresh/runtime.ts";
import { useSignal } from "@preact/signals";
import { signal } from "@preact/signals";
import { Header } from "../islands/Header.tsx";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  const count = useSignal(3);
  const productHidden = signal(true);
  const sidebarHidden = signal(true);

  return (
    <>
      <Head>
        <title>fresh-app03 Home</title>
      </Head>
      <Header productHidden={productHidden} sidebarHidden={sidebarHidden} />
      <div class="px-4 py-8 mx-auto bg-[#86efac]">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <img
            class="my-6"
            src="/logo.svg"
            width="128"
            height="128"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="text-4xl font-bold">Welcome to fresh</h1>
          <p class="my-4">
            Try updating this message in the
            <code class="mx-2">./routes/index.tsx</code> file, and refresh.
          </p>
          <Counter count={count} />
        </div>
      </div>
    </>
  );
}
