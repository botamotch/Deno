import { Falling, Jumping, Running, Sitting, State } from "./playerStates.tsx";
import { Game } from "./game.tsx";

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
  maxFrame: number;
  fps: number;
  frameInterval: number;
  frameTimer: number;
  constructor(game: Game) {
    this.game = game;
    this.width = 1200 / 12;
    this.height = 913 / 10;
    this.x = 0;
    this.y = this.game.height - this.height - this.game.groundMargin;
    this.frameX = 0;
    this.frameY = 0;
    this.image = document.getElementById("player") as HTMLImageElement;
    this.speed = 0;
    this.maxSpeed = 10;
    this.vy = 0;
    this.weight = 1.5;
    this.maxFrame = 0;
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.states = [
      new Sitting(this),
      new Running(this),
      new Jumping(this),
      new Falling(this),
    ];
    this.currentState = this.states[1];
    this.currentState.enter();
  }

  update(input: string[], deltaTime: number) {
    this.currentState.handleInput(input);
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
    this.y += this.vy;
    if (!this.onGround()) this.vy += this.weight;
    else this.vy = 0;
    // sprite animation
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    } else {
      this.frameTimer += deltaTime;
    }
  }

  draw(context: CanvasRenderingContext2D) {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
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
    return this.y >= this.game.height - this.height - this.game.groundMargin;
  }

  setState(state: number) {
    this.currentState = this.states[state];
    this.currentState.enter();
  }

  checkCollision() {
  }
}
