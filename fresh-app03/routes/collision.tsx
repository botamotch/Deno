import { Head } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Header } from "../islands/Header.tsx";
import { Collision } from "../islands/Collision.tsx";

export default function Game() {
  const productHidden = signal(true);
  const sidebarHidden = signal(true);

  return (
    <>
      <Head>
        <title>Collision</title>
      </Head>
      <Header productHidden={productHidden} sidebarHidden={sidebarHidden} />
      <Collision />
    </>
  );
}
