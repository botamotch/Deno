import { Player } from "./player.tsx";

const states = {
  SITTING: 0,
  RUNNING: 1,
  JUMPING: 2,
  FALLING: 3,
};

export class State {
  state: string;
  constructor(state: string) {
    this.state = state;
  }
  enter() {}
  handleInput(_: string[]) {}
}

export class Sitting extends State {
  player: Player;
  constructor(player: Player) {
    super("SITTING");
    this.player = player;
  }
  enter() {
    this.player.frameX = 0;
    this.player.frameY = 5;
    this.player.maxFrame = 4;
    this.player.game.speed = 0;
  }
  handleInput(input: string[]) {
    if (input.includes("ArrowLeft") || input.includes("ArrowRight")) {
      this.player.setState(states.RUNNING);
    }
  }
}

export class Running extends State {
  player: Player;
  constructor(player: Player) {
    super("RUNING");
    this.player = player;
  }
  enter() {
    this.player.frameX = 0;
    this.player.frameY = 3;
    this.player.maxFrame = 6;
    this.player.game.speed = 3;
  }
  handleInput(input: string[]) {
    if (input.includes("ArrowDown")) {
      this.player.setState(states.SITTING);
    } else if (input.includes("ArrowUp")) {
      this.player.setState(states.JUMPING);
    }
  }
}

export class Jumping extends State {
  player: Player;
  constructor(player: Player) {
    super("JUMPING");
    this.player = player;
  }
  enter() {
    this.player.frameX = 0;
    this.player.frameY = 1;
    this.player.maxFrame = 6;
    this.player.game.speed = 3;
    if (this.player.onGround()) this.player.vy -= 30;
  }
  handleInput(_: string[]) {
    if (this.player.vy > this.player.weight) {
      this.player.setState(states.FALLING);
    }
  }
}
export class Falling extends State {
  player: Player;
  constructor(player: Player) {
    super("FALLING");
    this.player = player;
  }
  enter() {
    this.player.frameX = 0;
    this.player.frameY = 2;
    this.player.maxFrame = 6;
    this.player.game.speed = 3;
  }
  handleInput(_: string[]) {
    if (this.player.onGround()) {
      this.player.setState(states.RUNNING);
    }
  }
}
