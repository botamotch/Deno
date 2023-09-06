import { Head } from "$fresh/runtime.ts";
import { Header } from "../islands/Header.tsx";
import { FinalChapter } from "../islands/FinalChapter/main.tsx";

export default function Page() {
  return (
    <>
      <Head>
        <title>Final Chapter</title>
      </Head>
      <Header page="Final Chapter" />
      <FinalChapter/>
    </>
  );
}
