import { Head } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Header } from "../islands/Header.tsx";
import { Shoot } from "../islands/Shoot.tsx";

export default function Page() {
  const productHidden = signal(true);
  const sidebarHidden = signal(true);

  return (
    <>
      <Head>
        <title>Shoot</title>
      </Head>
      <Header productHidden={productHidden} sidebarHidden={sidebarHidden} />
      <Shoot />
    </>
  );
}
