import { Game } from "./game.tsx";

export class Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  frameX: number;
  frameY: number;
  fps: number;
  frameInterval: number;
  frameTimer: number;
  speedX: number;
  speedY: number;
  maxFrame: number;
  markedForDeletion: boolean;
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.maxFrame = 0;
    this.fps = 20;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.markedForDeletion = false;
  }
  update(deltaTime: number) {
    this.x -= this.speedX;
    this.y += this.speedY;
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    } else {
      this.frameTimer += deltaTime;
    }
    if (this.x + this.width < 0) this.markedForDeletion = true;
  }
  draw(_: CanvasRenderingContext2D) {}
}

export class FlyingEnemy extends Enemy {
  game: Game;
  image: HTMLImageElement;
  angle: number;
  va: number;
  constructor(game: Game) {
    super();
    this.game = game;
    this.width = 60;
    this.height = 44;
    this.x = this.game.width;
    this.y = Math.random() * this.game.height * 0.5;
    this.speedX = Math.random() * 1 + 1;
    this.maxFrame = 5;
    this.image = document.getElementById("enemy_fly") as HTMLImageElement;
    this.angle = 0;
    this.va = Math.random() * 0.1 + 0.1;
  }
  draw(context: CanvasRenderingContext2D) {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
    context.drawImage(
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
    super.update(deltaTime);
    this.x -= this.game.speed;
    this.angle += this.va;
    this.y += Math.sin(this.angle);
  }
}

export class GroundEnemy extends Enemy {
  game: Game;
  image: HTMLImageElement;
  constructor(game: Game) {
    super();
    this.game = game;
    this.image = document.getElementById("enemy_plant") as HTMLImageElement;
    this.width = 60;
    this.height = 87;
    this.x = this.game.width;
    this.y = this.game.height - this.height - this.game.groundMargin;
    this.speedX = 0;
    this.speedY = 0;
    this.maxFrame = 1;
  }
  update(deltaTime: number) {
    super.update(deltaTime);
    this.x -= this.game.speed;
  }
  draw(context: CanvasRenderingContext2D) {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
    context.drawImage(
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
}

export class ClimbingEnemy extends Enemy {
  game: Game;
  image: HTMLImageElement;
  constructor(game: Game) {
    super();
    this.game = game;
    this.image = document.getElementById(
      "enemy_spider_big",
    ) as HTMLImageElement;
    this.x = this.game.width;
    this.y = Math.random() * this.game.height * 0.5;
    this.width = 120;
    this.height = 144;
    this.speedX = 0;
    this.speedY = Math.random() > 0.5 ? 1 : -1;
    this.maxFrame = 5;
  }
  update(deltaTime: number) {
    super.update(deltaTime);
    this.x -= this.game.speed;
    if (this.y > this.game.height - this.height - this.game.groundMargin) {
      this.speedY *= -1;
    }
    if (this.y < -this.height) this.markedForDeletion = true;
  }
  draw(context: CanvasRenderingContext2D) {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
    context.drawImage(
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
    context.beginPath();
    context.moveTo(this.x + this.width * 0.5, 0);
    context.lineTo(this.x + this.width * 0.5, this.y + 50);
    context.stroke();
  }
}
