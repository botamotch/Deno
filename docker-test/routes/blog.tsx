import { Head } from "$fresh/runtime.ts";
import BlogSection from "../islands/BlogSection.tsx";
import Header from "../islands/Header.tsx";

export default function Blog() {
  return (
    <>
      <Head>
        <title>Blog Section</title>
      </Head>
      <Header page="Blog Section" />
      <BlogSection />
    </>
  );
}
