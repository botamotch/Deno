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
    let score = 0;
    let gameOver = false;

    const fullScrrenButton = document.getElementById("fullScrrenButton") as HTMLButtonElement;

    canvas.width = 1200;
    canvas.height = 700;
    let enemies: Enemy[] = [];

    class InputHandler {
      keys: string[];
      touchY: number;
      touchThreshold = 30;
      constructor() {
        this.keys = [];
        this.touchY = -1;
        self.window.addEventListener("keydown", (e: KeyboardEvent) => {
          if (
            (e.key === "ArrowDown" || e.key === "ArrowUp" ||
              e.key === "ArrowLeft" || e.key === "ArrowRight") &&
            this.keys.indexOf(e.key) === -1
          ) {
            this.keys.push(e.key);
          } else if (e.key === "Enter" && gameOver) restartGame();
        });
        self.window.addEventListener("keyup", (e: KeyboardEvent) => {
          if (
            e.key === "ArrowDown" || e.key === "ArrowUp" ||
            e.key === "ArrowLeft" || e.key === "ArrowRight"
          ) {
            this.keys.splice(this.keys.indexOf(e.key), 1);
          }
        });
        self.window.addEventListener("touchstart", (e) => {
          this.touchY = e.changedTouches[0].pageY;
        })
        self.window.addEventListener("touchmove", (e) => {
          const swipeDistance = e.changedTouches[0].pageY - this.touchY;
          if (swipeDistance < -this.touchThreshold && this.keys.indexOf("SwipeUp") === -1) this.keys.push("SwipeUp");
          else if (swipeDistance > this.touchThreshold && this.keys.indexOf("SwipeDown") === -1) {
            this.keys.push("SwipeDown");
            if (gameOver) restartGame();
          }
        })
        self.window.addEventListener("touchend", (e) => {
          console.log(this.keys);
          this.keys.splice(this.keys.indexOf("SwipeUp"), 1);
          this.keys.splice(this.keys.indexOf("SwipeDown"), 1);
        })
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
      maxFrame: number;
      fps: number;
      frameTimer: number;
      frameInterval: number;
      weight: number;
      constructor(gameWidth: number, gameHeight: number) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 200;
        this.height = 200;
        this.x = 100;
        this.y = this.gameHeight - this.height;
        this.vx = 0;
        this.vy = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 8;
        this.fps = 20;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;
        this.weight = 1;
        this.image = document.getElementById("playerImage") as HTMLImageElement;
      }
      draw(ctx: CanvasRenderingContext2D) {
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
      update(input: InputHandler, deltaTime: number, enemies: Enemy[]) {
        // coollision detection
        enemies.forEach((enemy) => {
          const dx = (enemy.x + enemy.width * 0.5) - (this.x + this.width * 0.5)
          const dy = (enemy.y + enemy.height * 0.5) - (this.y + this.height * 0.5)
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < enemy.width * 0.5 + enemy.height * 0.5) {
            gameOver = true;
          }
        })
        // sprite animation
        if (this.frameTimer > this.frameInterval) {
          if (this.frameX >= this.maxFrame) this.frameX = 0;
          else this.frameX++;
          this.frameTimer = 0;
        } else {
          this.frameTimer += deltaTime;
        }
        if (input.keys.indexOf("ArrowRight") > -1) {
          this.vx = 8;
        } else if (input.keys.indexOf("ArrowLeft") > -1) {
          this.vx = -8;
        } else {
          this.vx = 0;
        }
        if ((input.keys.indexOf("ArrowUp") > -1 || input.keys.indexOf("SwipeUp") > -1) && this.onGround()) {
          this.vy = -25;
          this.frameX = 0;
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
          this.maxFrame = 5;
        } else {
          this.vy = 0;
          this.frameY = 0;
          this.maxFrame = 8;
        }
      }
      restart() {
        this.x = 100;
        this.y = this.gameHeight - this.height;
        this.vy = 0;
        this.maxFrame = 8;
        this.frameY = 0;
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
        this.speed = 5;
        this.image = document.getElementById(
          "backgroundImage",
        ) as HTMLImageElement;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(
          this.image,
          this.x + this.width - this.speed,
          this.y,
          this.width,
          this.height,
        );
      }
      update() {
        this.x -= this.speed;
        if (this.x < 0 - this.width) this.x = 0;
      }
      restart() {
        this.x = 0;
      }
    }

    class Enemy {
      x: number;
      y: number;
      width: number;
      height: number;
      gameWidth: number;
      gameHeight: number;
      image: HTMLImageElement;
      frameX: number;
      maxFrame: number;
      fps: number;
      frameTimer: number;
      frameInterval: number;
      speed: number;
      markedForDeletion: boolean;
      constructor(gameWidth: number, gameHeight: number) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 160;
        this.height = 119;
        this.x = this.gameWidth;
        this.y = this.gameHeight - this.height;
        this.image = document.getElementById("enemyImage") as HTMLImageElement;
        this.frameX = 0;
        this.maxFrame = 5;
        this.fps = 20;
        this.frameTimer = 0;
        this.frameInterval = 1000 / this.fps;
        this.speed = 8;
        this.markedForDeletion = false;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.drawImage(
          this.image,
          this.frameX * this.width,
          0,
          this.width,
          this.height,
          this.x,
          this.y,
          this.width,
          this.height,
        );
      }
      update(deltaTime: number) {
        if (this.frameTimer > this.frameInterval) {
          if (this.frameX >= this.maxFrame) this.frameX = 0;
          else this.frameX++;
          this.frameTimer = 0;
        } else {
          this.frameTimer += deltaTime;
        }
        this.x -= this.speed;
        if (this.x < 0 - this.width) {
          this.markedForDeletion = true;
          score++;
        }
      }
    }

    function handleEnemies(deltaTime: number) {
      if (enemyTimer > enemyInterval) {
        enemies.push(new Enemy(canvas.width, canvas.height));
        enemyInterval = Math.random() * 500 + 1000;
        enemyTimer = 0;
      } else {
        enemyTimer += deltaTime;
      }
      assertIsDefined(ctx);
      enemies.forEach((enemy) => {
        enemy.draw(ctx);
        enemy.update(deltaTime);
      });
      enemies = enemies.filter((enemy) => !enemy.markedForDeletion);
    }

    function displayStatusText(ctx: CanvasRenderingContext2D) {
      assertIsDefined(ctx);
      ctx.textAlign = "left";
      ctx.font = "40px Helvetica";
      ctx.fillStyle = "black";
      ctx.fillText("Score: " + score, 20, 50);
      ctx.fillStyle = "white";
      ctx.fillText("Score: " + score, 23, 53);
      if (gameOver) {
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText("GAME OVER, Press Enter or swipe down to restart!", canvas.width * 0.5, canvas.height * 0.2);
        ctx.fillStyle = "white";
        ctx.fillText("GAME OVER, Press Enter or swipe down to restart!", canvas.width * 0.5 + 3, canvas.height * 0.2 + 3);
      }
    }

    function restartGame() {
      player.restart();
      background.restart();
      enemies = [];
      score = 0;
      gameOver = false;
      animate();
    }

    function toggleFullScreen() {
      console.log(document.fullscreenElement);
      if(!document.fullscreenElement) {
        canvas.requestFullscreen().then().catch(err => {
          alert(`Err, can't enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
    fullScrrenButton.addEventListener("click", toggleFullScreen);

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = Date.now();
    let enemyTimer = 0;
    let enemyInterval = 1000;

    function animate() {
      const timeStamp = Date.now();
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;
      assertIsDefined(ctx);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      background.draw(ctx);
      background.update();
      player.draw(ctx);
      player.update(input, deltaTime, enemies);
      handleEnemies(deltaTime);
      displayStatusText(ctx);
      if (!gameOver) requestAnimationFrame(animate);
    }
    animate();
  });
}

export function SideScroll() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-0 px-0 mx-auto max-w-full">
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="bg-blue-300 border-4 border-black w-[1200px] h-[700px]"
        />
        <img class="hidden" id="playerImage" src="side-scroll/player.png" />
        <img
          class="hidden"
          id="backgroundImage"
          src="side-scroll/background_single.png"
        />
        <img class="hidden" id="enemyImage" src="side-scroll/enemy_1.png" />
        <button id="fullScrrenButton" class="absolute text-sm m-4 p-2 inline-block rounded-md bg-gray-100">Toggle Fullscreen</button>
      </div>
    </div>
  );
}
