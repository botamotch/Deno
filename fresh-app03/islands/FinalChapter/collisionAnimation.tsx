import { Game } from "./game.tsx";

export class CollisionAnimation {
  x: number;
  y: number;
  width: number;
  height: number;
  sizeMofifier: number;
  spriteWidth: number;
  spriteHeight: number;
  image: HTMLImageElement;
  frameX: number;
  maxFrame: number;
  markedForDeletion: boolean;
  fps: number;
  frameInterval: number;
  frameTimer: number;
  constructor(
    public game: Game,
    x: number,
    y: number,
  ) {
    this.image = document.getElementById(
      "collisionAnimation",
    ) as HTMLImageElement;
    this.spriteWidth = 1000 / 5;
    this.spriteHeight = 179;
    this.sizeMofifier = Math.random() * 0.5 + 0.4;
    this.width = this.spriteWidth * this.sizeMofifier;
    this.height = this.spriteHeight * this.sizeMofifier;
    this.frameX = 0;
    this.maxFrame = 4;
    this.markedForDeletion = false;
    this.x = x - this.width * 0.5;
    this.y = y - this.width * 0.5;
    this.fps = Math.random() * 10 + 5;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
  }

  draw(context: CanvasRenderingContext2D) {
    context.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
  update(deltaTime: number) {
    this.x -= this.game.speed;
    if (this.frameTimer > this.frameInterval) {
      this.frameX++;
      this.frameTimer = 0;
    } else {
      this.frameTimer += deltaTime;
    }

    if (this.frameX > this.maxFrame) this.markedForDeletion = true;
  }
}
