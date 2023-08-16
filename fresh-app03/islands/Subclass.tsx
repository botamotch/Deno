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
    const worm = document.getElementById("worm") as HTMLImageElement;
    const ghost = document.getElementById("ghost") as HTMLImageElement;
    const spider = document.getElementById("spider") as HTMLImageElement;

    canvas.width = 500;
    canvas.height = 800;

    class Game {
      enemies: Enemy[];
      ctx: CanvasRenderingContext2D;
      width: number;
      height: number;
      enemyInterval: number;
      enemyTimer: number;
      enemyType: string[];
      constructor(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
      ) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.enemies = [];
        this.enemyInterval = 500;
        this.enemyTimer = 0;
        this.enemyType = ["worm", "ghost", "spider"];
        this.#addNewEnemy();
      }

      update(deltaTime: number) {
        this.enemies = this.enemies.filter((object) =>
          !object.markedForDeletion
        );
        if (this.enemyTimer > this.enemyInterval) {
          this.#addNewEnemy();
          this.enemyTimer = 0;
          console.log(this.enemies);
        } else {
          this.enemyTimer += deltaTime;
        }
        this.enemies.forEach((object) => object.update(deltaTime));
      }
      draw() {
        this.enemies.forEach((object) => object.draw(this.ctx));
      }
      #addNewEnemy() {
        const randomEnemy =
          this.enemyType[Math.floor(Math.random() * this.enemyType.length)];
        if (randomEnemy == "worm") {
          this.enemies.push(new Worm(this));
        } else if (randomEnemy == "ghost") {
          this.enemies.push(new Ghost(this));
        } else if (randomEnemy == "spider") {
          this.enemies.push(new Spider(this));
        }
        this.enemies.sort(function (a, b) {
          return a.y - b.y;
        });
      }
    }

    class Enemy {
      x: number;
      y: number;
      width: number;
      height: number;
      spriteWidth: number;
      spriteHeight: number;
      vx: number;
      vy: number;
      game: Game;
      markedForDeletion: boolean;
      image: HTMLImageElement;
      constructor(game: Game) {
        this.game = game;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height;
        this.width = 100;
        this.height = 100;
        this.spriteWidth = 0;
        this.spriteHeight = 0;
        this.markedForDeletion = false;
        this.image = new Image();
        this.vx = Math.random() * 0.1 + 0.1;
        this.vy = 0;
      }
      update(deltaTime: number) {
        this.x -= this.vx * deltaTime;
        if (this.x < 0 - this.width) {
          this.markedForDeletion = true;
        }
      }
      draw(ctx: CanvasRenderingContext2D) {
        assertIsDefined(ctx);
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        // ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(
          this.image,
          0,
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

    class Worm extends Enemy {
      constructor(game: Game) {
        super(game);
        this.x = this.game.width;
        this.y = this.game.height - this.height;
        this.spriteWidth = 1374 / 6;
        this.spriteHeight = 171;
        this.width = this.spriteWidth * 0.5;
        this.height = this.spriteHeight * 0.5;
        this.image = worm;
        this.vx = Math.random() * 0.1 + 0.1;
      }
    }

    class Ghost extends Enemy {
      angle: number;
      curve: number;
      constructor(game: Game) {
        super(game);
        this.x = this.game.width;
        this.y = this.game.height * Math.random() * 0.6;
        this.spriteWidth = 1566 / 6;
        this.spriteHeight = 209;
        this.width = this.spriteWidth * 0.5;
        this.height = this.spriteHeight * 0.5;
        this.image = ghost;
        this.vx = Math.random() * 0.2 + 0.1;
        this.angle = Math.random() * Math.PI;
        this.curve = Math.random() * 1 + 2;
      }
      update(deltaTime: number) {
        super.update(deltaTime);
        this.y += Math.sin(this.angle) * this.curve;
        this.angle += 0.04;
      }
      draw() {
        this.game.ctx.save();
        this.game.ctx.globalAlpha = 0.5;
        super.draw(this.game.ctx);
        this.game.ctx.restore();
      }
    }

    class Spider extends Enemy {
      maxLength: number;
      constructor(game: Game) {
        super(game);
        this.x = Math.random() * this.game.width;
        this.y = 0 - this.height;
        this.spriteWidth = 1860 / 6;
        this.spriteHeight = 175;
        this.width = this.spriteWidth * 0.5;
        this.height = this.spriteHeight * 0.5;
        this.image = spider;
        this.vx = 0;
        this.vy = Math.random() * 0.1 + 0.1;
        this.maxLength = Math.random() * this.game.height;
      }
      update(deltaTime: number) {
        super.update(deltaTime);
        this.y += this.vy * deltaTime;
        if (this.y > this.maxLength) this.vy *= -1
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
