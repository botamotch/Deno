import {
  RunningLeft,
  RunningRight,
  SittingLeft,
  SittingRight,
  StandingLeft,
  StandingRight,
  JumpingLeft,
  JumpingRight,
  FallingLeft,
  FallingRight,
  State,
} from "./state.tsx";

export default class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  gameWidth: number;
  gameHeight: number;
  states: State[];
  currentState: State;
  image: HTMLImageElement;
  frameX: number;
  frameY: number;
  speed: number;
  maxSpeed: number;
  vy: number;
  weight: number;
  maxFrame: number;

  constructor(gameWidth: number, gameHeight: number) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.states = [
      new StandingLeft(this),
      new StandingRight(this),
      new SittingLeft(this),
      new SittingRight(this),
      new RunningLeft(this),
      new RunningRight(this),
      new JumpingLeft(this),
      new JumpingRight(this),
      new FallingLeft(this),
      new FallingRight(this),
    ];
    this.image = document.getElementById("dogImage") as HTMLImageElement;
    this.width = 200;
    this.height = 181.83;
    this.x = this.gameWidth * 0.5 - this.width * 0.5;
    this.y = this.gameHeight - this.height;
    this.frameX = 0;
    this.frameY = 0;
    this.speed = 0;
    this.maxSpeed = 10;
    this.vy = 0;
    this.weight = 1;
    this.maxFrame = 5;
    this.currentState = this.states[0];
  }

  draw(contxt: CanvasRenderingContext2D) {
    if (this.frameX < this.maxFrame) this.frameX++;
    else this.frameX = 0;
    contxt.drawImage(
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

  update(input: string) {
    this.currentState.handleInput(input);
    // horizontal movement
    this.x += this.speed;
    if (this.x <= 0) this.x = 0;
    else if (this.x >= this.gameWidth - this.width) this.x = this.gameWidth - this.width;
    // vertical mevement
    this.y += this.vy;
    if (!this.onGround()) {
      this.vy += this.weight;
    } else {
      this.vy = 0;
    }
  }

  onGround() {
    return this.y >= this.gameHeight - this.height;
  }

  setState(state: number) {
    this.currentState = this.states[state];
    this.currentState.enter();
  }
}
