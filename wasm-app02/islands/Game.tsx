import { instantiate, main } from "@/lib/rs_lib.generated.js";
import { useEffect } from "preact/hooks";
// import { assertIsDefined } from "@/islands/Util.tsx";

export default function Game() {
  useEffect(() => {
    (async () => {
      await instantiate({
        url: new URL("rs_lib_bg.wasm", location.origin),
      });
      main();
    })();
  });

  return (
    <div class="p-4 mx-auto max-w-full text-center bg-blue-100">
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400 my-4"
        onClick={() => console.log(Date.now().toString())}
      >
        Button
      </button>
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="border-0 bg-gray-100"
        />
      </div>
    </div>
  );
}
