import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";
import { Subclass } from "../islands/Subclass.tsx";

export default function Page() {

  return (
    <>
      <Head>
        <title>Enemy types with JavaScript sub classing</title>
      </Head>
      <Header page="Subclass" />
      <Subclass />
    </>
  );
}
