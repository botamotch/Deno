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

    class Game {
      enemies: Enemy[];
      ctx: CanvasRenderingContext2D;
      width: number;
      height: number;
      enemyInterval: number;
      enemyTimer: number;
      constructor(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
      ) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.enemies = [];
        this.enemyInterval = 1000;
        this.enemyTimer = 0;
        this.#addEnewEnemy();
      }

      update(deltaTime: number) {
        this.enemies = this.enemies.filter((object) =>
          !object.markedForDeletion
        );
        if (this.enemyTimer > this.enemyInterval) {
          this.#addEnewEnemy();
          this.enemyTimer = 0;
        } else {
          this.enemyTimer += deltaTime;
        }
        this.enemies.forEach((object) => object.update());
      }
      draw() {
        this.enemies.forEach((object) => object.draw(this.ctx));
      }
      #addEnewEnemy() {
        this.enemies.push(new Enemy(this));
      }
    }

    class Enemy {
      x: number;
      y: number;
      width: number;
      height: number;
      game: Game;
      markedForDeletion: boolean;
      constructor(game: Game) {
        this.game = game;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height;
        this.width = 100;
        this.height = 100;
        this.markedForDeletion = false;
      }
      update() {
        this.x--;
        if (this.x < 0 - this.width) {
          this.markedForDeletion = true;
        }
      }
      draw(ctx: CanvasRenderingContext2D) {
        assertIsDefined(ctx);
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }

    const game = new Game(ctx, canvas.width, canvas.height);

    let lastTime = Date.now();
    function animate() {
      assertIsDefined(ctx);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const presentTime = Date.now();
      const deltaTime = presentTime - lastTime;
      lastTime = presentTime;
      game.update(deltaTime);
      game.draw();
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
