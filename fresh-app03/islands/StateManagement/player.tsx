import {
  RunningLeft,
  RunningRight,
  SittingLeft,
  SittingRight,
  StandingLeft,
  StandingRight,
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
    ];
    this.currentState = this.states[0];
    this.image = document.getElementById("dogImage") as HTMLImageElement;
    this.width = 200;
    this.height = 181.83;
    this.x = this.gameWidth * 0.5 - this.width * 0.5;
    this.y = this.gameHeight - this.height;
    this.frameX = 0;
    this.frameY = 0;
  }

  draw(contxt: CanvasRenderingContext2D) {
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
  }

  setState(state: number) {
    this.currentState = this.states[state];
    this.currentState.enter();
  }
}
