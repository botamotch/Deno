import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";
import { Collision } from "../islands/Collision.tsx";

export default function Game() {

  return (
    <>
      <Head>
        <title>Collision</title>
      </Head>
      <Header page="Collision" />
      <Collision />
    </>
  );
}
