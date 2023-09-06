import { useEffect } from "preact/hooks";
import Player from "./player.tsx";
import InputHandler from "./input.tsx";
import { drawStatesText, assertIsDefined } from "./utils.tsx";

function script() {
  self.window.addEventListener("load", function () {
    const loading = document.getElementById("loading");
    assertIsDefined(loading);
    loading.style.display = "none";

    const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
    assertIsDefined(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    assertIsDefined(ctx);

    const player = new Player(canvas.width, canvas.height);
    console.log(player);

    const input = new InputHandler();

  let lastTime = Date.now();
    function animate() {
      assertIsDefined(ctx);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const timestamp = Date.now();
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      player.update(input.lastkey);
      player.draw(ctx, deltaTime);
      drawStatesText(ctx, input, player);
      requestAnimationFrame(animate);
    }

    animate();
  });
}

export function StateManagement() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-0 px-0 mx-auto max-w-full">
      <div class="flex justify-center">
        <canvas id="canvas1" class="bg-blue-300 absolute top-0 left-0" />
        <img
          id="dogImage"
          class="hidden"
          src="states/dog_left_right_white.png"
        />
        <h1 id="loading" class="absolute top-1/2 left-1/2 text-center text-8xl">
          LOADING ...
        </h1>
      </div>
    </div>
  );
}
