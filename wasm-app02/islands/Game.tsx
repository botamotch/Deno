import { instantiate, main } from "@/lib/rs_lib.generated.js";
import { useEffect } from "preact/hooks";
// import { assertIsDefined } from "@/islands/Util.tsx";

export default function Game() {
  useEffect(() => {
    // const ui = document.getElementById("ui");
    // if (ui) {
    //   ui.insertAdjacentHTML("afterbegin", "<button>New Game</button>");
    // }

    (async () => {
      await instantiate({
        url: new URL("rs_lib_bg.wasm", location.origin),
      });
      main();
    })();
  });

  return (
    <div class="p-4 mx-auto max-w-full text-center">
      <div class="flex justify-center">
        <div id="ui" class="relative">
          {
            /*
          <button class="absolute top-0 left-0 m-2 bg-button hover:bg-buttonHover active:bg-buttonClicked font-kenney text-2xl w-[190px] h-[49px]">
            New Game
          </button>
            */
          }
          <canvas
            id="canvas1"
            class="border-0 bg-gray-100"
          >
          </canvas>
        </div>
      </div>
    </div>
  );
}
