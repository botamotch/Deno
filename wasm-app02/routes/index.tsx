import { Head } from "$fresh/runtime.ts";
import Nav from "@/islands/Navigation.tsx";
import Header from "@/islands/Header.tsx";
import Footer from "@/islands/Footer.tsx";
import Button from "@/islands/Button.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div class="h-screen flex-col">
        <Header />
        <div class="flex flex-1 flex-row">
          <main class="flex-1 bg-white p-4">
            <h1 class="mt-4 text-xl font-bold tracking-tight text-gray-900">
              <a
                href="https://github.com/PacktPublishing/Game-Development-with-Rust-and-WebAssembly"
                target="_blank"
              >
                PacktPublishing/Game-Development-with-Rust-and-WebAssembly
              </a>
            </h1>
            <p class="mt-6 text-base leading-7 text-gray-600">
              Home
            </p>
            <div class="text-center">
              <Button />
            </div>
            <Footer />
          </main>
          <Nav />
        </div>
      </div>
    </>
  );
}
