import { Head } from "$fresh/runtime.ts";
import { Header } from "../../islands/Header.tsx";
import { StateManagement } from "../../islands/StateManagement/script.tsx";

export default function Page() {
  return (
    <>
      <Head>
        <title>Stete Management</title>
      </Head>
      <Header page="States Management" />
      <StateManagement/>
    </>
  );
}

