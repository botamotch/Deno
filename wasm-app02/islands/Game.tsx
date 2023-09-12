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
    <div class="p-10 mx-auto max-w-full">
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="border-0 bg-gray-100"
        />
      </div>
    </div>
  );
}
