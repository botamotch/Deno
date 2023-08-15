import { useEffect } from "preact/hooks";

function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      `Expected 'val' to be defined, but received ${val}`,
    );
  }
}

function script() {
  self.window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    assertIsDefined(ctx);

    canvas.width = 500;
    canvas.height = 800;
    let lastTime = 1;

    class Game {
      enemies: Enemy[];
      constructor() {
        this.enemies = [];
      }

      update() {}
      draw() {}
      #addEnewEnemy() {}
    }

    class Enemy {
      constructor() {}
      update() {}
      draw() {}
    }

    function animate() {
      assertIsDefined(ctx);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const timeStamp = Date.now();
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;
      // console.log(deltaTime);
      requestAnimationFrame(animate);
    }

    animate();
  });
}

export function Subclass() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-0 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="bg-blue-300 absolute insert-x-1/2 border-4 border-black w-[500px] h-[800px]"
        />
        <img class="hidden" id="worm" src="enemy/enemy_worm.png" />
        <img class="hidden" id="ghost" src="enemy/enemy_ghost.png" />
        <img class="hidden" id="spider" src="enemy/enemy_spider.png" />
      </div>
    </div>
  );
}
