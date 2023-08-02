import { Head } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { Header } from "../islands/Header.tsx";
import { BlogSection } from "../islands/BlogSection.tsx";

export default function About() {
  const productHidden = signal(true);
  const sidebarHidden = signal(true);

  return (
    <>
      <Head>
        <title>About Page</title>
      </Head>
      <Header productHidden={productHidden} sidebarHidden={sidebarHidden} />
      <BlogSection />
    </>
  );
}
