import { InputHandler } from "./input.tsx";
import { State, Sitting } from "./playerStates.tsx";

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
    this.player.update(this.input.keys);
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
  frameX: number;
  frameY: number;
  vy: number;
  image: HTMLImageElement;
  speed: number;
  maxSpeed: number;
  weight: number;
  states: State[];
  currentState: State;
  constructor(game: Game) {
    this.game = game;
    this.width = 1200 / 12;
    this.height = 913 / 10;
    this.x = 0;
    this.y = this.game.height - this.height;
    this.frameX = 0;
    this.frameY = 0;
    this.image = document.getElementById("player") as HTMLImageElement;
    this.speed = 0;
    this.maxSpeed = 10;
    this.vy = 0;
    this.weight = 1;
    this.states = [new Sitting(this)];
    this.currentState = this.states[0];
    this.currentState.enter();
  }

  update(input: string[]) {
    // horizontal
    this.x += this.speed;
    if (input.includes("ArrowRight")) this.speed = this.maxSpeed;
    else if (input.includes("ArrowLeft")) this.speed = -this.maxSpeed;
    else this.speed = 0;
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.width - this.width) {
      this.x = this.game.width - this.width;
    }
    // vertical
    if (input.includes("ArrowUp") && this.onGround()) this.vy = -20;
    this.y += this.vy;
    if (!this.onGround()) this.vy += this.weight;
    else this.vy = 0;
  }

  draw(context: CanvasRenderingContext2D) {
    context.drawImage(
      this.image,
      this.width * this.frameX,
      this.height * this.frameY,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
  onGround() {
    return this.y >= this.game.height - this.height;
  }

  setState(state: number) {
    this.currentState = this.states[state];
    this.currentState.enter();
  }
}
