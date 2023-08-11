import { Head } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Header } from "../islands/Header.tsx";
import { Background } from "../islands/Background.tsx";

export default function Game() {
  const productHidden = signal(true);
  const sidebarHidden = signal(true);

  return (
    <>
      <Head>
        <title>Game Page</title>
      </Head>
      <Header productHidden={productHidden} sidebarHidden={sidebarHidden} />
      <Background />
    </>
  );
}

