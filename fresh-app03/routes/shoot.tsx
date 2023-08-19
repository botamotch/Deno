import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";
import { Shoot } from "../islands/Shoot.tsx";

export default function Page() {

  return (
    <>
      <Head>
        <title>Shoot</title>
      </Head>
      <Header page="Shoot" />
      <Shoot />
    </>
  );
}
