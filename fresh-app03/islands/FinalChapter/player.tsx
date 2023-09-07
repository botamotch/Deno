import { InputHandler } from "./input.tsx";

export class Game {
  width: number;
  height: number;
  player: Player;
  input: InputHandler;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.player = new Player(this);
    this.input = new InputHandler();
  }
  update() {
    this.player.update();
  }

  draw(context: CanvasRenderingContext2D) {
    this.player.draw(context);
  }
}

export class Player {
  game: Game;
  width: number;
  height: number;
  x: number;
  y: number;
  image: HTMLImageElement;
  constructor(game: Game) {
    this.game = game;
    this.width = 1200 / 12;
    this.height = 913 / 10;
    this.x = 0;
    this.y = this.game.height - this.height;
    this.image = document.getElementById("player") as HTMLImageElement;
  }

  update() {
    this.x += 1;
  }

  draw(context: CanvasRenderingContext2D) {
    context.drawImage(
      this.image,
      this.width * 0,
      this.height * 0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}
