import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";
import { EnemyScreen } from "../islands/Enemy.tsx";

export default function Game() {

  return (
    <>
      <Head>
        <title>Enemy</title>
      </Head>
      <Header page="Enemy" />
      <EnemyScreen/>
    </>
  );
}


