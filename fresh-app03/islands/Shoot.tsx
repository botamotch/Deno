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
  assertIsDefined(ctx);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let timeToNextRaven = 0;
  const ravenInterval = 500;
  let lastTime = Date.now();
  let score = 0;
  ctx.font = "50px Impact";

  let ravens: Raven[] = [];

  class Raven {
    width: number;
    height: number;
    x: number;
    y: number;
    directionX: number;
    directionY: number;
    markedForDeletion: boolean;
    image: HTMLImageElement;
    spriteWidth: number;
    spriteHeight: number;
    sizeModifier: number;
    frame: number;
    maxFrame: number;
    timeSinceFlap: number;
    flapInterval: number;
    constructor() {
      this.spriteWidth = 1626 / 6;
      this.spriteHeight = 194;
      this.sizeModifier = Math.random() * 0.6 + 0.4;
      this.width = this.spriteWidth * this.sizeModifier;
      this.height = this.spriteHeight * this.sizeModifier;
      this.x = canvas.width;
      this.y = Math.random() * (canvas.height - this.height);
      this.directionX = Math.random() * 5 + 3;
      this.directionY = Math.random() * 5 - 2.5;
      this.markedForDeletion = false;
      this.image = new Image();
      this.image.src = "raven.png";
      this.frame = 0;
      this.maxFrame = 4;
      this.timeSinceFlap = 0;
      this.flapInterval = 50;
    }

    update(deltaTime: number) {
      if (this.y < 0 || this.y > canvas.height - this.height) {
        this.directionY = this.directionY * -1;
      }
      this.x -= this.directionX;
      this.y += this.directionY;
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
      }
      this.timeSinceFlap += deltaTime;
      if (this.timeSinceFlap > this.flapInterval) {
        if (this.frame > this.maxFrame) {
          this.frame = 0;
        } else {
          this.frame++;
        }
        this.timeSinceFlap = 0;
      }
    }
    draw() {
      assertIsDefined(ctx);
      ctx.drawImage(
        this.image,
        this.spriteWidth * this.frame,
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

  function drawScore() {
    assertIsDefined(ctx);
    ctx.fillStyle = "black";
    ctx.fillText("Score : " + score, 50, 75);
    ctx.fillStyle = "white";
    ctx.fillText("Score : " + score, 55, 80);
  }

  function animate() {
    assertIsDefined(ctx);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const timestamp = Date.now();
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;
    if (timeToNextRaven > ravenInterval) {
      ravens.push(new Raven());
      timeToNextRaven = 0;
    }
    drawScore();
    [...ravens].forEach((object) => object.update(deltaTime));
    [...ravens].forEach((object) => object.draw());
    ravens = ravens.filter((object) => !object.markedForDeletion);
    // console.log(ravens);

    requestAnimationFrame(animate);
  }
  animate();
}

export function Shoot() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-10 px-0 max-w-fit">
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="bg-blue-300 max-w-fit h-[800px]"
        />
      </div>
    </div>
  );
}
