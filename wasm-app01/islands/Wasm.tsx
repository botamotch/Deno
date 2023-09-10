import { greet } from "./wasm/pkg.js";

function greetFunc() {
  console.log("hello");
}

export default function WasmButton() {
  return (
    <button class="px-4 py-2 rounded-md bg-gray-100" onClick={() => greet("John")}>
      wasm button
    </button>
  );
}
