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
  const numberOfEnemies = 10;
  const enemiesArray: Enemy[] = [];

  let gameFrame = 0;

  class Enemy {
    x: number;
    y: number;
    width: number;
    height: number;
    spriteWidth: number;
    spriteHeight: number;
    speed: number;
    frame: number;
    flapSpeed: number;
    image: HTMLImageElement;
    angle: number;
    angleSpeed: number;
    curve: number;
    constructor() {
      this.image = new Image();
      this.image.src = "enemy2.png";
      this.spriteWidth = 266;
      this.spriteHeight = 188;
      this.width = this.spriteWidth / 2.5;
      this.height = this.spriteHeight / 2.5;
      this.x = Math.random() * (canvas.width - this.width);
      this.y = Math.random() * (canvas.height - this.height);
      this.speed = Math.random() * 4 + 1;
      this.frame = 0;
      this.flapSpeed = Math.floor(Math.random() * 3 + 1);
      this.angle = Math.random() * 2;
      this.angleSpeed = Math.random() * 0.2;
      this.curve = Math.random() * 10;
    }
    update() {
      this.x -= this.speed;
      this.y += this.curve * Math.sin(this.angle);
      this.angle += this.angleSpeed;
      if (this.x + this.width < 0) this.x = canvas.width;
      if (gameFrame % this.flapSpeed === 0) {
        this.frame > 4 ? this.frame = 0 : this.frame++;
      }
    }
    draw() {
      assertIsDefined(ctx);
      ctx.drawImage(
        this.image,
        this.frame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      );
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
    gameFrame++;

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
