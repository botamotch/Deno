import { Head } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Header } from "../islands/Header.tsx";
import { Subclass } from "../islands/Subclass.tsx";

export default function Page() {
  const productHidden = signal(true);
  const sidebarHidden = signal(true);

  return (
    <>
      <Head>
        <title>Enemy types with JavaScript sub classing</title>
      </Head>
      <Header productHidden={productHidden} sidebarHidden={sidebarHidden} />
      <Subclass />
    </>
  );
}
