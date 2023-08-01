import { signal, useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import { Button, Product } from "../islands/AboutButton.tsx";

import { BlogSection, FlyoutHeader } from "../components/Tailwind.tsx";

export default function About() {
  const count = useSignal(3);
  const productHidden = signal(true);
  return (
    <>
      <FlyoutHeader />
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <Product hidden={productHidden} />

        <Button>hello</Button>
        <Counter count={count} />
      </div>
      <BlogSection />
    </>
  );
}
