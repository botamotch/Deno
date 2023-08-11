import { useEffect } from "preact/hooks";

function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      `Expected 'val' to be defined, but received ${val}`,
    );
  }
}

function script() {
  const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  const CANVAS_WIDTH = canvas.width = 800;
  const CANVAS_HEIGHT = canvas.height = 700;
  let gameSpeed = 15;

  const BackgroundLayer1 = new Image();
  const BackgroundLayer2 = new Image();
  const BackgroundLayer3 = new Image();
  const BackgroundLayer4 = new Image();
  const BackgroundLayer5 = new Image();
  BackgroundLayer1.src = "layer-1.png";
  BackgroundLayer2.src = "layer-2.png";
  BackgroundLayer3.src = "layer-3.png";
  BackgroundLayer4.src = "layer-4.png";
  BackgroundLayer5.src = "layer-5.png";

  let x = 0;
  let x2 = 2400;

  function animate() {
    assertIsDefined(ctx);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(BackgroundLayer4, x, 0);
    ctx.drawImage(BackgroundLayer4, x2, 0);
    if (x < -2400) {
      x = 2400 + x2 - gameSpeed;
    } else {
      x -= gameSpeed;
    }
    if (x2 < -2400) {
      x2 = 2400 + x - gameSpeed;
    } else {
      x2 -= gameSpeed;
    }
    requestAnimationFrame(animate);
  }

  animate();
}

export function Background() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-10 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas id="canvas1" class="border-4 border-black w-[600px] h-[600px]">
        </canvas>
      </div>
    </div>
  );
}
