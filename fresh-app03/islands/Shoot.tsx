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
  // const canvasPosision = canvas.getBoundingClientRect();
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
  const ravenInterval = 1000;
  let lastTime = Date.now();
  let score = 0;
  let gameOver = false;
  ctx.font = "50px sans-serif";

  let ravens: Raven[] = [];
  let explosions: Explosion[] = [];
  let particles: Particle[] = [];

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
    hasTrail: boolean;
    constructor() {
      this.spriteWidth = 1626 / 6;
      this.spriteHeight = 194;
      this.sizeModifier = Math.random() * 0.6 + 0.4;
      this.width = this.spriteWidth * this.sizeModifier;
      this.height = this.spriteHeight * this.sizeModifier;
      this.x = canvas.width;
      this.y = Math.random() * (canvas.height - this.height);
      this.directionX = Math.random() * 3 + 2;
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
      this.hasTrail = Math.random() > 0.5;
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
        if (this.hasTrail) {
          for (let i = 0; i < 5; i++) {
            particles.push(
              new Particle(this.x, this.y, this.width, this.color),
            );
          }
        }
      }
      if (this.x < 0 - this.width) gameOver = true;
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

  class Explosion {
    x: number;
    y: number;
    size: number;
    spriteWidth: number;
    spriteHeight: number;
    frame: number;
    sound: HTMLAudioElement;
    image: HTMLImageElement;
    timeSinceLastFrame: number;
    frameInterval: 200;
    markedForDeletion: boolean;

    constructor(x: number, y: number, size: number) {
      this.image = new Image();
      this.image.src = "boom.png";
      this.sound = new Audio();
      this.sound.src = "explodemini.wav";

      this.x = x;
      this.y = y;
      this.size = size;
      this.spriteWidth = 1000 / 5;
      this.spriteHeight = 179;
      this.frame = 0;
      this.timeSinceLastFrame = 0;
      this.frameInterval = 200;
      this.markedForDeletion = false;
    }

    update(deltatime: number) {
      if (this.frame === 0) {
        this.sound.play();
      }
      this.timeSinceLastFrame += deltatime;
      if (this.timeSinceLastFrame > this.frameInterval) {
        this.frame++;
        if (this.frame > 5) {
          this.markedForDeletion = true;
        }
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
        this.size,
        this.size,
      );
    }
  }

  class Particle {
    x: number;
    y: number;
    size: number;
    radius: number;
    maxRadius: number;
    speedX: number;
    color: string;
    markedForDeletion: boolean;

    constructor(x: number, y: number, size: number, color: string) {
      this.size = size;
      this.x = x + this.size * 0.5 + Math.random() * 50 - 25;
      this.y = y + this.size * 0.3 + Math.random() * 50 - 25;
      this.color = color;
      this.radius = Math.random();
      this.maxRadius = Math.random() * 20 + 35;
      this.speedX = Math.random() * 1 + 0.5;
      this.markedForDeletion = false;
    }

    update() {
      this.x += this.speedX;
      this.radius += 0.5;
      if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }
    draw() {
      assertIsDefined(ctx);
      ctx.save();
      ctx.globalAlpha = 1 - this.radius / this.maxRadius;
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawScore() {
    assertIsDefined(ctx);
    ctx.fillStyle = "black";
    ctx.fillText("Score : " + score, 50, 75);
    ctx.fillStyle = "white";
    ctx.fillText("Score : " + score, 55, 80);
  }

  function drawGameOver() {
    assertIsDefined(ctx);
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(
      "GAME OVER, your score is " + score,
      canvas.width * 0.5,
      canvas.height * 0.5,
    );
    ctx.fillStyle = "white";
    ctx.fillText(
      "GAME OVER, your score is " + score,
      canvas.width * 0.5 + 5,
      canvas.height * 0.5 + 5,
    );
  }

  self.window.addEventListener("click", function (e) {
    const positionX = e.x;
    const positionY = e.y;
    const detectPixelColor = collisionCtx.getImageData(
      positionX,
      positionY,
      1,
      1,
    );
    const pc = detectPixelColor.data;
    // console.log(pc);
    ravens.forEach((object) => {
      if (
        object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] &&
        object.randomColors[2] === pc[2]
      ) {
        object.markedForDeletion = true;
        score++;
        explosions.push(new Explosion(object.x, object.y, object.width));
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
    [...particles, ...ravens, ...explosions].forEach((object) =>
      object.update(deltaTime)
    );
    [...particles, ...ravens, ...explosions].forEach((object) => object.draw());
    ravens = ravens.filter((object) => !object.markedForDeletion);
    explosions = explosions.filter((object) => !object.markedForDeletion);
    particles = particles.filter((object) => !object.markedForDeletion);
    // console.log(ravens);

    if (!gameOver) {
      requestAnimationFrame(animate);
    } else {
      drawGameOver();
    }
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
          class="absolute opacity-0 w-full h-[800px]"
        />
        <canvas
          id="canvas1"
          class="bg-blue-300 absolute w-full h-[800px]"
        />
      </div>
    </div>
  );
}
