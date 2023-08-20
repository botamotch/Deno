import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";
import { SideScroll } from "../islands/SideScroll.tsx";

export default function Page() {
  return (
    <>
      <Head>
        <title>Side Scroll</title>
      </Head>
      <Header page="Side Scroll" />
      <SideScroll />
    </>
  );
}
