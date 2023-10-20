import { hello, instantiate } from "@/lib/rs_lib.generated.js";
import { useEffect } from "preact/hooks";

export default function Button() {
  useEffect(() => {
    (async () => {
      await instantiate({
        url: new URL("rs_lib_bg.wasm", location.origin),
      });
    })();
  });

  return (
    <button
      type="button"
      class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400 my-4"
      // onClick={() => {
      //   console.log(`Hello World from Deno : ${Date.now().toString()}`);
      // }}
      onClick={hello}
    >
      Button
    </button>
  );
}
