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

    canvas.width = 800;
    canvas.height = 720;

    class InputHandler {
      keys: string[];
      constructor() {
        this.keys = [];
        self.window.addEventListener("keydown", (e: KeyboardEvent) => {
          if (
            (e.key === "ArrowDown" || e.key === "ArrowUp" ||
              e.key === "ArrowLeft" || e.key === "ArrowRight") &&
            this.keys.indexOf(e.key) === -1
          ) {
            this.keys.push(e.key);
          }
        });
        self.window.addEventListener("keyup", (e: KeyboardEvent) => {
          if (
            e.key === "ArrowDown" || e.key === "ArrowUp" ||
            e.key === "ArrowLeft" || e.key === "ArrowRight"
          ) {
            this.keys.splice(this.keys.indexOf(e.key), 1);
          }
        });
      }
    }

    class Player {
      x: number;
      y: number;
      vx: number;
      vy: number;
      width: number;
      height: number;
      gameWidth: number;
      gameHeight: number;
      image: HTMLImageElement;
      frameX: number;
      frameY: number;
      weight: number;
      constructor(gameWidth: number, gameHeight: number) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 200;
        this.height = 200;
        this.x = 0;
        this.y = this.gameHeight - this.height;
        this.vx = 0;
        this.vy = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.weight = 1;
        this.image = document.getElementById("playerImage") as HTMLImageElement;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(
          this.image,
          this.frameX * this.width,
          this.frameY * this.height,
          this.width,
          this.height,
          this.x,
          this.y,
          this.width,
          this.height,
        );
      }
      update(input: InputHandler) {
        if (input.keys.indexOf("ArrowRight") > -1) {
          this.vx = 5;
        } else if (input.keys.indexOf("ArrowLeft") > -1) {
          this.vx = -5;
        } else {
          this.vx = 0;
        }
        if (input.keys.indexOf("ArrowUp") > -1 && this.onGround()) {
          this.vy = -30;
        }
        // horizontol movement
        this.x += this.vx;
        if (this.x < 0) this.x = 0;
        else if (this.x > this.gameWidth - this.width) {
          this.x = this.gameWidth - this.width;
        }
        // vertical movement
        this.y += this.vy;
        if (!this.onGround()) {
          this.vy += this.weight;
          this.frameY = 1;
        } else {
          this.vy = 0;
          this.frameY = 0;
        }
      }

      onGround() {
        return this.y >= this.gameHeight - this.height;
      }
    }

    class Background {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      gameWidth: number;
      gameHeight: number;
      image: HTMLImageElement;
      constructor(gameWidth: number, gameHeight: number) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.x = 0;
        this.y = 0;
        this.width = 2400;
        this.height = 720;
        this.speed = 10;
        this.image = document.getElementById(
          "backgroundImage",
        ) as HTMLImageElement;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
      }
      update(){
        this.x -= this.speed;
        if (this.x < 0 - this.width) this.x = 0;

      }
    }

    class Enemy {}

    function handleEnemies() {
    }

    function displayStatusText() {
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    function animate() {
      assertIsDefined(ctx);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      background.draw(ctx);
      background.update();
      player.draw(ctx);
      player.update(input);
      requestAnimationFrame(animate);
    }
    animate();
  });
}

export function SideScroll() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-10 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="bg-blue-300 border-4 border-black w-[800px] h-[720px]"
        />
        <img class="hidden" id="playerImage" src="side-scroll/player.png" />
        <img
          class="hidden"
          id="backgroundImage"
          src="side-scroll/background_single.png"
        />
        <img class="hidden" id="enemyImage" src="side-scroll/enemy_1.png" />
      </div>
    </div>
  );
}
