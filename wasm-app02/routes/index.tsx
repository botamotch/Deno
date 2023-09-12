import { Head } from "$fresh/runtime.ts";
import Game from "@/islands/Game.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Game Development by Rust and WebAssembly</title>
      </Head>
      <Game />
    </>
  );
}
