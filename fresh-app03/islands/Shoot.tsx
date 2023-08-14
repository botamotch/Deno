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
  const canvasPosision = canvas.getBoundingClientRect();
  const ctx = canvas.getContext("2d");
  assertIsDefined(ctx);
  const collisionCanvas = document.getElementById(
    "collisionCanvas",
  ) as HTMLCanvasElement;
  const collisionCtx = collisionCanvas.getContext("2d");
  assertIsDefined(collisionCtx);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  collisionCanvas.width = window.innerWidth;
  collisionCanvas.height = window.innerHeight;

  let timeToNextRaven = 0;
  const ravenInterval = 500;
  let lastTime = Date.now();
  let score = 0;
  ctx.font = "50px sans-serif";

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
    randomColors: number[];
    color: string;
    constructor() {
      this.spriteWidth = 1626 / 6;
      this.spriteHeight = 194;
      this.sizeModifier = Math.random() * 0.6 + 0.4;
      this.width = this.spriteWidth * this.sizeModifier;
      this.height = this.spriteHeight * this.sizeModifier;
      this.x = canvas.width;
      this.y = Math.random() * (canvas.height - this.height);
      this.directionX = Math.random() * 3 + 1;
      this.directionY = Math.random() * 5 - 2.5;
      this.markedForDeletion = false;
      this.image = new Image();
      this.image.src = "raven.png";
      this.frame = 0;
      this.maxFrame = 4;
      this.timeSinceFlap = 0;
      this.flapInterval = 50;
      this.randomColors = [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
      ];
      this.color = "rgb(" + this.randomColors[0] + "," + this.randomColors[1] +
        "," + this.randomColors[2] + ")";
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
      assertIsDefined(collisionCtx);
      collisionCtx.fillStyle = this.color;
      collisionCtx.fillRect(this.x, this.y, this.width, this.height);
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

  self.window.addEventListener("click", function (e) {
    const positionX = e.x - canvasPosision.left;
    const positionY = e.y - canvasPosision.top;
    const detectPixelColor = collisionCtx.getImageData(
      positionX,
      positionY,
      1,
      1,
    );
    const pc = detectPixelColor.data;
    console.log(pc);
    ravens.forEach((object) => {
      if (
        object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] &&
        object.randomColors[2] === pc[2]
      ) {
        object.markedForDeletion = true;
        score++;
      }
    });
  });

  function animate() {
    assertIsDefined(ctx);
    assertIsDefined(collisionCtx);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    const timestamp = Date.now();
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;
    if (timeToNextRaven > ravenInterval) {
      ravens.push(new Raven());
      timeToNextRaven = 0;
      ravens.sort(function (a, b) {
        return a.width - b.width;
      });
    }
    drawScore();
    if (ravens.length < 20) {
      [...ravens].forEach((object) => object.update(deltaTime));
    }
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
    <div class="py-0 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas
          id="collisionCanvas"
          class="absolute w-full h-[800px]"
        />
        <canvas
          id="canvas1"
          class="absolute opacit-0 w-full h-[800px]"
        />
      </div>
    </div>
  );
}
