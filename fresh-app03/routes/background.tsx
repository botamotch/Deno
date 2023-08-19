import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";
import { Background } from "../islands/Background.tsx";

export default function Game() {

  return (
    <>
      <Head>
        <title>Background</title>
      </Head>
      <Header page="Background" />
      <Background />
    </>
  );
}

