import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";
import { Container } from "../islands/Container.tsx";

export default function Game() {
  return (
    <>
      <Head>
        <title>Dog</title>
      </Head>
      <Header page="Dog" />
      <Container />
    </>
  );
}
