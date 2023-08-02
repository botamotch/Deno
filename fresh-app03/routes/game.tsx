import { Head } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Header } from "../islands/Header.tsx";
import { Container } from "../islands/Container.tsx";

export default function Game() {
  const productHidden = signal(true);
  const sidebarHidden = signal(true);

  return (
    <>
      <Head>
        <title>Game Page</title>
      </Head>
      <Header productHidden={productHidden} sidebarHidden={sidebarHidden} />
      <Container />
    </>
  );
}
