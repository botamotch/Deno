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
  canvas.width = 500;
  canvas.height = 700;
  const ctx = canvas.getContext("2d");
  assertIsDefined(ctx);

  const canvasPosision = canvas.getBoundingClientRect();
  const explosions: Explosion[] = [];

  class Explosion {
    x: number;
    y: number;
    spriteWidth: number;
    spriteHeight: number;
    width: number;
    height: number;
    image: HTMLImageElement;
    sound: HTMLAudioElement;
    frame: number;
    timer: number;
    angle: number;
    constructor(x: number, y: number) {
      this.spriteWidth = 200;
      this.spriteHeight = 179;
      this.width = this.spriteWidth * 0.4;
      this.height = this.spriteHeight * 0.4;
      this.x = x;
      this.y = y;
      this.image = new Image();
      this.image.src = "boom.png";
      this.frame = 0;
      this.timer = 0;
      this.angle = Math.random() * 6.2;
      this.sound = new Audio();
      this.sound.src = "explode.wav";
    }

    update() {
      this.timer++;
      if (this.timer % 10 === 0) {
        this.frame++;
      }
    }

    draw() {
      assertIsDefined(ctx);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.drawImage(
        this.image,
        this.spriteWidth * this.frame,
        0,
        this.spriteWidth,
        this.spriteHeight,
        0 - this.width * 0.5,
        0 - this.height * 0.5,
        this.width,
        this.height,
      );
      ctx.restore();
    }
  }

  self.window.addEventListener("click", function (e) {
    createAnimation(e);
  });

  function createAnimation(e: MouseEvent) {
    const positionX = e.x - canvasPosision.left;
    const positionY = e.y - canvasPosision.top;
    if (
      0 < positionX && positionX < canvas.width && 0 < positionY &&
      positionY < canvas.height
    ) {
      explosions.push(new Explosion(positionX, positionY));
      explosions[explosions.length - 1].sound.play();
    }
  }

  function animate() {
    assertIsDefined(ctx);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < explosions.length; i++) {
      explosions[i].update();
      explosions[i].draw();
      if (explosions[i].frame > 5) {
        explosions.splice(i, 1);
        i--;
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}

export function Collision() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-10 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="border-4 border-black w-[500px] h-[700px]"
        />
      </div>
    </div>
  );
}
