import { Head } from "$fresh/runtime.ts";
import Game from "@/islands/Game.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Ch.1 Hello WebAssembly</title>
      </Head>
      <div class="text-center my-4">
        <h1 class="mt-4 text-xl font-bold tracking-tight text-gray-900">
          <a
            href="https://github.com/PacktPublishing/Game-Development-with-Rust-and-WebAssembly"
            target="_blank"
          >
            PacktPublishing/Game-Development-with-Rust-and-WebAssembly
          </a>
        </h1>
        <p class="mt-6 text-base leading-7 text-gray-600">
          Chapter1 Hello WebAssembly
        </p>
      </div>
      <Game />
    </>
  );
}
