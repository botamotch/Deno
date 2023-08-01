import type { Signal } from "@preact/signals";

import { JSX } from "preact";
import { ToggleHiddenButton } from "../components/Button.tsx";

interface HiddenProps {
  hidden: Signal<boolean>;
}

export function Product(props: HiddenProps) {
  return (
    <ToggleHiddenButton
      type="button"
      class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
      onClick={() => {
        props.hidden.value = !props.hidden.value;
        console.log("hello from product button :" + Date());
      }}
    >
      <span class="sr-only">Open main menu</span>
      <svg
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
    </ToggleHiddenButton>
  );
}

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      onClick={() => console.log("hello from about button : " + Date())}
    />
  );
}
