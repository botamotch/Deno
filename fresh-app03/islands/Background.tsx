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
  const CANVAS_WIDTH = canvas.width = 800;
  const CANVAS_HEIGHT = canvas.height = 700;
  let gameSpeed = 5;

  const BackgroundLayer1 = new Image();
  const BackgroundLayer2 = new Image();
  const BackgroundLayer3 = new Image();
  const BackgroundLayer4 = new Image();
  const BackgroundLayer5 = new Image();
  BackgroundLayer1.src = "layer-1.png";
  BackgroundLayer2.src = "layer-2.png";
  BackgroundLayer3.src = "layer-3.png";
  BackgroundLayer4.src = "layer-4.png";
  BackgroundLayer5.src = "layer-5.png";

  const slider = document.getElementById("slider") as HTMLInputElement;
  assertIsDefined(slider);
  slider.value = gameSpeed.toString();
  const showGameSpeed = document.getElementById(
    "showGameSpeed",
  ) as HTMLSpanElement;
  assertIsDefined(showGameSpeed);
  showGameSpeed.innerHTML = gameSpeed.toString();
  slider.addEventListener("change", function (_) {
    // assertIsDefined(e.target);
    // gameSpeed = e.target.value;
    // showGameSpeed.innerHTML = e.target.value;
    gameSpeed = Number(slider.value);
    showGameSpeed.innerHTML = slider.value;
  });

  class Layer {
    x: number;
    x2: number;
    y: number;
    width: number;
    height: number;
    speedModifier: number;
    speed: number;
    image: HTMLImageElement;

    constructor(image: HTMLImageElement, speedModifier: number) {
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 700;
      this.x2 = this.width;
      this.speedModifier = speedModifier;
      this.speed = gameSpeed * this.speedModifier;
      this.image = image;
    }
    update() {
      this.speed = gameSpeed * this.speedModifier;
      if (this.x <= -this.width) {
        this.x = this.width + this.x2 - this.speed;
      }
      if (this.x2 <= -this.width) {
        this.x2 = this.width + this.x - this.speed;
      }
      this.x = Math.floor(this.x - this.speed);
      this.x2 = Math.floor(this.x2 - this.speed);
    }

    draw() {
      assertIsDefined(ctx);
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      ctx.drawImage(this.image, this.x2, this.y, this.width, this.height);
    }
  }

  const gameObjects = [
    new Layer(BackgroundLayer1, 0.2),
    new Layer(BackgroundLayer2, 0.4),
    new Layer(BackgroundLayer3, 0.6),
    new Layer(BackgroundLayer4, 0.8),
    new Layer(BackgroundLayer5, 1.0),
  ];

  function animate() {
    assertIsDefined(ctx);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gameObjects.forEach((object) => {
      object.update();
      object.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

export function Background() {
  useEffect(() => {
    script();
  }, []);

  return (
    <div class="py-10 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas
          id="canvas1"
          class="border-4 border-black w-[600px] h-[600px]"
        />
      </div>
      <div class="flex justify-center py-5">
        <p>
          Game Speed: <span id="showGameSpeed" />
        </p>
        <input
          type="range"
          min="0"
          max="20"
          value="5"
          class="slider"
          id="slider"
        />
      </div>
    </div>
  );
}
