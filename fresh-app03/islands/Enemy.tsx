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
  const CANVAS_WIDTH = canvas.width = 500;
  const CANVAS_HEIGHT = canvas.height = 1000;
  const numberOfEnemies = 100;
  const enemiesArray: Enemy[] = [];

  class Enemy {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.width;
      this.width = 100;
      this.height = 100;
      this.speed = Math.random() * 4 -2;
    }
    update() {
      this.x += this.speed;
      this.y += this.speed;
    }
    draw() {
      assertIsDefined(ctx);
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  for (let i = 0; i < numberOfEnemies; i++) {
    enemiesArray.push(new Enemy());
  }

  function animate() {
    assertIsDefined(ctx);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    enemiesArray.forEach((enemy) => {
      enemy.update();
      enemy.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

export function EnemyScreen() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-10 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="border-4 border-black w-[500px] h-[1000px]"
        />
      </div>
    </div>
  );
}
