import { Game } from "./game.tsx";

export class Particle {
  game: Game;
  markedForDeletion: boolean;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  size: number;
  color: string;
  constructor(game: Game) {
    this.game = game;
    this.markedForDeletion = false;
    this.x = 0;
    this.y = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.size = 1;
    this.color = "black";
  }
  update() {
    this.x -= this.speedX + this.game.speed;
    this.y -= this.speedY;
    this.size *= 0.95;
    if (this.size < 0.5) this.markedForDeletion = true;
  }
  draw(_: CanvasRenderingContext2D) {}
}

export class Dust extends Particle {
  constructor(game: Game, x: number, y: number) {
    super(game);
    this.size = Math.random() * 10 + 10;
    this.x = x;
    this.y = y;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this.color = "rgba(0,0,0,0.5)";
  }
  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }
}

export class Splash extends Particle {}

export class Fire extends Particle {
  image: HTMLImageElement;
  angle: number;
  va: number;
  constructor(game: Game, x: number, y: number) {
    super(game);
    this.x = x;
    this.y = y;
    this.speedX = 1;
    this.speedY = 1;
    this.size = Math.random() * 100 + 50;
    this.image = document.getElementById("fire") as HTMLImageElement;
    this.angle = 0;
    this.va = Math.random() * 0.2 - 0.1;
  }
  update() {
    super.update();
    this.angle += this.va;
    this.x += Math.sin(this.angle * 10);
  }

  draw(context: CanvasRenderingContext2D) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.drawImage(
      this.image,
      -this.size * 0.5,
      -this.size * 0.5,
      this.size,
      this.size,
    );
    context.restore();
  }
}
