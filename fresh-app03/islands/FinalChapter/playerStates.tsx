import { Player } from "./player.tsx";

const states = {
  SITTING: 0,
  RUNNING: 1,
  JUMPING: 2,
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
    this.player.frameY = 5;
  }
  handleInput(input: string[]) {
    if (input.includes("ArrowLeft")) {
    }
  }
}
